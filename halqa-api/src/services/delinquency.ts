import { prisma } from '../db';
import { audit, ledger } from '../lib/audit';
import { clampScore } from '../lib/money';
import { settleContribution } from '../lib/settlement';

export type DelinquencySummary={checked:number;late:number;missed:number;postReceiptDefaults:number;autoCovered:number};

// Net vault balance from the ledger (principal only — accrued profit is
// realised at sweep time and is never spent before it exists).
async function vaultBalance(userId:string):Promise<bigint>{
  const account=`user:${userId}:vault`;
  const entries=await prisma.ledgerEntry.findMany({where:{OR:[{credit:account},{debit:account}]},select:{credit:true,debit:true,amountPaisa:true}});
  let balance=0n;
  for(const entry of entries){if(entry.credit===account)balance+=entry.amountPaisa;if(entry.debit===account)balance-=entry.amountPaisa;}
  return balance;
}

export async function evaluateDelinquencies(now=new Date()):Promise<DelinquencySummary>{
  const reminderWindow = new Date(now.getTime() + 3 * 86_400_000);
  const upcoming = await prisma.payment.findMany({ where: { status: 'PENDING', reminderLevel: 0, dueDate: { gte: now, lte: reminderWindow }, round: { status: 'COLLECTING' } }, include: { round: { include: { committee: true } } } });
  for (const payment of upcoming) {
    const policy = (payment.round.committee.riskPolicyJson && typeof payment.round.committee.riskPolicyJson === 'object' ? payment.round.committee.riskPolicyJson : {}) as Record<string, unknown>;
    if (policy.smartNudges === false) continue;
    const days = Math.max(0, Math.ceil((payment.dueDate.getTime() - now.getTime()) / 86_400_000));
    await prisma.$transaction(async tx => {
      const claimed = await tx.payment.updateMany({ where: { id: payment.id, reminderLevel: 0 }, data: { reminderLevel: 1 } });
      if (claimed.count) await tx.notification.create({ data: { userId: payment.payerId, type: 'PAYMENT_COUNTDOWN', message: `${days} day(s) remain to record your ${payment.round.committee.name} installment. Missing it can reduce your score, lock Halqa features, and put deposits or payout holdbacks at risk.` } });
    });
  }
  // Vault auto-cover (opt-in): before an overdue installment is punished or
  // escalated, settle it from the member's own vault if the balance covers it.
  // The money flows vault → external → escrow through the standard settlement
  // path, so the usual late penalty and score adjustment still apply — the
  // safety net stops the *escalation* (missed / default), not the fairness.
  let autoCovered=0;
  const coverable=await prisma.payment.findMany({
    where:{status:{in:['PENDING','LATE']},dueDate:{lt:now},round:{status:'COLLECTING',committee:{status:'ACTIVE'}},payer:{vaultAutoCover:true,isBanned:false}},
    include:{round:{include:{committee:true}},payer:true},
  });
  for(const payment of coverable){
    try{
      const balance=await vaultBalance(payment.payerId);
      if(balance<payment.round.committee.contributionPaisa)continue;
      await prisma.$transaction(async tx=>{
        await ledger(tx,{committeeId:payment.round.committeeId,actorId:payment.payerId,debit:`user:${payment.payerId}:vault`,credit:`user:${payment.payerId}:external`,amountPaisa:payment.round.committee.contributionPaisa,reason:'VAULT_AUTO_COVER_RELEASE',refType:'Payment',refId:payment.id,idempotencyKey:`autocover:${payment.id}:release`});
        await settleContribution(tx,{round:payment.round,payment,paidVia:'VAULT_AUTO_COVER',txnRef:`AUTOCOVER-${payment.id.slice(-8)}`,idempotencyKey:`autocover:${payment.id}`,actorId:payment.payerId,now});
        await tx.notification.create({data:{userId:payment.payerId,type:'VAULT_AUTO_COVER',message:`${payment.round.committee.name}: your overdue installment was covered from your Sukoon Vault so it never became a default. The standard late adjustment still applies.`}});
      });
      autoCovered++;
    }catch{/* already settled or claimed concurrently — the next pass sees the truth */}
  }

  const obligations=await prisma.payment.findMany({
    where:{status:{in:['PENDING','LATE']},dueDate:{lt:now},round:{status:'COLLECTING'}},
    include:{round:{include:{committee:true}},payer:true},
  });
  const summary:DelinquencySummary={checked:obligations.length,late:0,missed:0,postReceiptDefaults:0,autoCovered};
  for(const payment of obligations){
    const daysLate=Math.max(1,Math.ceil((now.getTime()-payment.dueDate.getTime())/86_400_000));
    const membership=await prisma.committeeMember.findUnique({where:{committeeId_userId:{committeeId:payment.round.committeeId,userId:payment.payerId}},include:{securityDeposits:true}});
    if(!membership||membership.status!=='ACTIVE')continue;
    const postReceiptDefault=membership.hasReceived&&daysLate>payment.round.graceDays;
    const missed=!postReceiptDefault&&daysLate>payment.round.graceDays;
    const stage=postReceiptDefault?'post_receipt_default':missed?'missed':daysLate>=4?'late_4_7':'late_1_3';
    const policy=(payment.round.committee.riskPolicyJson&&typeof payment.round.committee.riskPolicyJson==='object'?payment.round.committee.riskPolicyJson:{}) as Record<string,unknown>;
    const targetPenalty=postReceiptDefault?-Number(policy.postReceiptPenaltyPoints??200):missed?-40:daysLate>=4?-20:-10;
    const penaltyRateBps=postReceiptDefault||missed?1000:daysLate>=4?500:payment.round.committee.latePenaltyBps;
    const penaltyPaisa=payment.round.committee.contributionPaisa*BigInt(penaltyRateBps)/10_000n;
    const priorEvents=await prisma.creditEvent.findMany({where:{userId:payment.payerId,roundId:payment.roundId,checkpoint:{startsWith:'delinquency:'}},select:{delta:true}});
    const priorPenalty=priorEvents.reduce((sum,event)=>sum+event.delta,0);
    const delta=Math.min(0,targetPenalty-priorPenalty);
    await prisma.$transaction(async tx=>{
      await tx.payment.update({where:{id:payment.id},data:{status:missed||postReceiptDefault?'MISSED':'LATE',penaltyPaisa,reminderLevel:Math.max(payment.reminderLevel,2)}});
      const event=await tx.creditEvent.createMany({data:[{userId:payment.payerId,committeeId:payment.round.committeeId,roundId:payment.roundId,checkpoint:`delinquency:${stage}`,delta,reason:postReceiptDefault?'Default after receiving committee payout':missed?'Installment missed beyond grace':`Installment ${daysLate} day(s) late`}],skipDuplicates:true});
      if(event.count===1){
        const currentUser=await tx.user.findUniqueOrThrow({where:{id:payment.payerId},select:{creditScore:true}});
        const cooldownUntil=new Date(now);cooldownUntil.setMonth(cooldownUntil.getMonth()+Number(policy.rehabilitationCooldownMonths??12));
        await tx.user.update({where:{id:payment.payerId},data:{creditScore:clampScore(currentUser.creditScore+delta),paymentStreak:0,...(postReceiptDefault?{isBanned:true,defaultFlag:true,cooldownUntil,banReason:'Default after receiving a committee payout'}:{})}});
        if(postReceiptDefault){
          await tx.committeeMember.update({where:{id:membership.id},data:{status:'BANNED'}});
          const deposits=membership.securityDeposits.filter(item=>item.status==='HELD');
          await tx.securityDeposit.updateMany({where:{membershipId:membership.id,status:'HELD'},data:{status:'FORFEITED',releasedAt:now}});
          for(const deposit of deposits) await ledger(tx,{committeeId:payment.round.committeeId,actorId:payment.payerId,debit:`committee:${payment.round.committeeId}:deposit_reserve`,credit:`committee:${payment.round.committeeId}:escrow`,amountPaisa:deposit.amountPaisa,reason:'DEFAULT_DEPOSIT_FORFEITURE',refType:'SecurityDeposit',refId:deposit.id,idempotencyKey:`default:${payment.id}:deposit:${deposit.id}`});
          await tx.payoutHoldback.updateMany({where:{membershipId:membership.id,status:'HELD'},data:{status:'FORFEITED',releasedAt:now}});
          await tx.recoveryCase.upsert({where:{paymentId:payment.id},update:{outstandingPaisa:payment.amountPaisa,penaltyPaisa,status:'OPEN'},create:{userId:payment.payerId,committeeId:payment.round.committeeId,roundId:payment.roundId,paymentId:payment.id,outstandingPaisa:payment.amountPaisa,penaltyPaisa}});
          const commitment=await tx.protectionCommitment.findUnique({where:{membershipId:membership.id}});
          if(commitment?.guarantorUserId){
            const guarantor=await tx.user.findUniqueOrThrow({where:{id:commitment.guarantorUserId}});
            await tx.user.update({where:{id:guarantor.id},data:{creditScore:clampScore(guarantor.creditScore-25)}});
            await tx.creditEvent.create({data:{userId:guarantor.id,committeeId:payment.round.committeeId,roundId:payment.roundId,checkpoint:`guarantor-default:${payment.id}`,delta:-25,reason:'Guaranteed member defaulted after payout'}});
            await tx.notification.create({data:{userId:guarantor.id,type:'GUARANTEE_TRIGGERED',message:`A member you guaranteed defaulted in ${payment.round.committee.name}. Your reliability score was reduced by 25 points.`}});
          }
        }
        await tx.notification.create({data:{userId:payment.payerId,type:postReceiptDefault?'ACCOUNT_RESTRICTED':missed?'PAYMENT_MISSED':'PAYMENT_LATE',message:postReceiptDefault?'Your account is restricted after a post-payout default. Clear all dues to begin rehabilitation.':missed?`Your ${payment.round.committee.name} installment passed its grace period.`:`Your ${payment.round.committee.name} installment is ${daysLate} day(s) late.`}});
        await audit(tx,null,'DELINQUENCY_CHECKPOINT','Payment',payment.id,{stage,daysLate,delta,at:now.toISOString()});
      }
    });
    if(postReceiptDefault)summary.postReceiptDefaults++;else if(missed)summary.missed++;else summary.late++;
  }
  return summary;
}
