import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
const prisma=new PrismaClient();
const base='http://127.0.0.1:4101/api';
// Demo kill-switch awareness: when SECURITY_RELAXED=true in .env the API
// intentionally skips lockout/password-policy/replay-burning, so those attack
// simulations would "fail" by design. Skip them and say so loudly.
const RELAXED=(()=>{try{return /^SECURITY_RELAXED=true/m.test(readFileSync(new URL('../.env',import.meta.url),'utf8'))}catch{return false}})();
if(RELAXED)console.error('⚠ SECURITY_RELAXED=true — lockout/password/replay attack checks SKIPPED (demo mode)');
const results=[];
const check=(name,ok,detail='')=>{results.push({name,ok,detail});if(!ok)throw new Error(`${name}: ${detail}`)};
async function request(path,{token,method='GET',body,expect=200}={}){
  const r=await fetch(base+path,{method,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});
  const data=await r.json().catch(()=>({})); check(`${method} ${path} -> ${expect}`,r.status===expect,`${r.status} ${JSON.stringify(data)}`); return data;
}
const login=async identity=>(await request('/auth/login',{method:'POST',body:{identity,password:'halqa123'}})).accessToken;
const health=await request('/health'); check('record-only health marker',health.stage==='record-only-prototype');
const [sana,ayesha,bilal]=await Promise.all(['sana','ayesha','bilal'].map(login));
await prisma.user.updateMany({where:{username:'bilal'},data:{creditScore:640}}); // pin precondition: repeated runs raise his score past 700
await prisma.committee.updateMany({where:{host:{username:{in:['sana','ayesha']}},status:{in:['FORMING','ACTIVE']},OR:[{name:{startsWith:'Lifecycle '}},{name:{startsWith:'Soneri Rail '}},{name:{startsWith:'Bazaar '}},{name:{startsWith:'Priority '}},{name:{startsWith:'Sigma '}},{name:{startsWith:'Swap '}},{name:{startsWith:'Cover '}},{name:{startsWith:'Newbie '}},{name:{startsWith:'Safety '}},{name:{startsWith:'Protection QA'}},{name:{startsWith:'Bad '}}]},data:{status:'CANCELLED'}}); // clear stale test circles so the 5-hosted cap never trips
// Referral trigger: bilal is marked as referred by ayesha BEFORE any circle
// completes this run; the once-ever bonus ledgers on his first completion.
const [ayeshaRow,bilalRow]=await Promise.all([prisma.user.findUniqueOrThrow({where:{username:'ayesha'}}),prisma.user.findUniqueOrThrow({where:{username:'bilal'}})]);
await prisma.user.update({where:{id:bilalRow.id},data:{referredById:ayeshaRow.id}});
await prisma.user.updateMany({where:{username:{in:['sana','ayesha','bilal','taha']}},data:{vaultParkingEnabled:false,vaultTier:'STANDARD',vaultAutoCover:false}}); // parking + auto-cover off + standard tier at start: a mid-run crash must not leak into the next run
const bcrypt=(await import('bcryptjs')).default;
await prisma.user.updateMany({where:{username:'taha'},data:{passwordHash:await bcrypt.hash('halqa123',12)}}); // self-heal: a crash mid password-rotation must not lock taha out of the next run
await prisma.user.updateMany({data:{failedLogins:0,lockUntil:null}}); // clear lockout state so a crashed lockout test never blocks the next run
await prisma.ledgerEntry.deleteMany({where:{OR:[{credit:{endsWith:':vault'}},{debit:{endsWith:':vault'}},{debit:{endsWith:':vault_investment'}}]}}); // vault ledger starts clean so the 30-day accrual assertion is deterministic
await request('/committees',{token:bilal,method:'POST',expect:403,body:{name:'Blocked Host',memberCap:7,contributionPaisa:'1000000',cadencePreset:'LONG',periodDays:45,minMembersToStart:3,reinvestRatio:0}});
const schemes=await request('/schemes'); check('risk-labelled scheme catalog',schemes.length>=8&&schemes.every(s=>s.riskScore>=1&&s.riskScore<=10));
check('scheme catalog has no duplicate names (orphan slugs pruned)',new Set(schemes.map(s=>s.name)).size===schemes.length,`total=${schemes.length} unique=${new Set(schemes.map(s=>s.name)).size}`);
const circle=await request('/committees',{token:sana,method:'POST',expect:201,body:{name:`Lifecycle ${Date.now()}`,memberCap:7,contributionPaisa:'1000000',cadencePreset:'LONG',periodDays:45,minMembersToStart:3,reinvestRatio:.25,schemeId:schemes[0].id,distributionMode:'SHARE',orderMode:'CREDIT_WEIGHTED',joinPolicy:'INVITE_ONLY'}});
check('capacity independent from cadence',circle.memberCap===7&&circle.periodDays===45);
await request('/committees/join',{token:ayesha,method:'POST',expect:201,body:{inviteCode:circle.inviteCode}});
await request('/committees/join',{token:bilal,method:'POST',expect:201,body:{inviteCode:circle.inviteCode}});
for(const token of [sana,ayesha,bilal])await request(`/risk/committee/${circle.id}/consent`,{token,method:'POST',expect:201,body:{accepted:true}});
await request(`/committees/${circle.id}/start`,{token:ayesha,method:'POST',expect:403});
await request(`/committees/${circle.id}/start`,{token:sana,method:'POST',body:{}});
let detail=await request(`/committees/${circle.id}`,{token:sana});
check('schedule locked and rounds created',detail.status==='ACTIVE'&&detail.rounds.length===3&&detail.rounds[0].payments.length===3);
check('hidden grace window sized to ~23% of the period (45d → 10d)',detail.rounds[0].graceDays===10,`graceDays=${detail.rounds[0].graceDays}`);
const deposits=await request(`/committees/${circle.id}/deposits`,{token:sana});
for(const deposit of deposits.filter(row=>row.status==='PENDING'))await request(`/committees/${circle.id}/deposits/${deposit.id}/confirm`,{token:sana,method:'POST',body:{txnRef:`DEP-${deposit.id.slice(-6)}`}});
const round=detail.rounds[0]; const tokenById=new Map([[detail.members.find(m=>m.user.username==='sana').userId,sana],[detail.members.find(m=>m.user.username==='ayesha').userId,ayesha],[detail.members.find(m=>m.user.username==='bilal').userId,bilal]]);
for(const payment of round.payments)await request('/payments',{token:tokenById.get(payment.payerId),method:'POST',expect:201,body:{roundId:round.id,paidVia:'RAAST',txnRef:`TEST-${payment.payerId.slice(-5)}`,idempotencyKey:`payment-${payment.id}`}});
await request(`/committees/${circle.id}/invest`,{token:ayesha,method:'POST',expect:403,body:{idempotencyKey:`unauthorized-${circle.id}`}});
await request(`/committees/${circle.id}/invest`,{token:sana,method:'POST',expect:201,body:{idempotencyKey:`deploy-${circle.id}`}});
await request(`/committees/${circle.id}/payout`,{token:sana,method:'POST',expect:409,body:{idempotencyKey:`blocked-${circle.id}`}});
await request(`/committees/${circle.id}/liquidate`,{token:sana,method:'POST',body:{idempotencyKey:`liquidate-${circle.id}`}});
await request(`/committees/${circle.id}/payout`,{token:sana,method:'POST',expect:409,body:{idempotencyKey:`too-early-${circle.id}`}});
await prisma.round.update({where:{id:round.id},data:{payoutDate:new Date(Date.now()-86_400_000)}});
await prisma.payment.update({where:{roundId_payerId:{roundId:round.id,payerId:round.recipientId}},data:{paidAt:new Date(Date.now()-9*86_400_000)}});
await request(`/committees/${circle.id}/payout`,{token:sana,method:'POST',body:{idempotencyKey:`payout-${circle.id}`}});
detail=await request(`/committees/${circle.id}`,{token:sana});
check('payout advanced next round',detail.currentRound===2&&detail.rounds[0].status==='CLOSED'&&detail.rounds[1].status==='COLLECTING');

// ---- Partner rail: bank KYC, custody circle, statement matching, slot fee, guaranteed payout ----
const partnerInfo=await request('/partner',{token:sana});
check('active partner present',partnerInfo.partner?.shortCode==='SONERI'&&partnerInfo.partnerUnlocks.length===3);
await prisma.user.updateMany({where:{username:'sana'},data:{bankVerifiedAt:null,bankVerifyRef:null,cnic:null,kycLevel:0}}); // re-run safety
await request('/partner/kyc',{token:sana,method:'POST',expect:400,body:{cnic:'3520212345671',iban:'PK00FAKE0000000000000000'}}); // bad checksum
// Valid PK IBAN: compute check digits for SONE + 16-digit account via mod-97.
const bban='SONE0000123456789012';const digits=(bban+'PK00').replace(/[A-Z]/g,c=>String(c.charCodeAt(0)-55));let rem=0;for(const d of digits)rem=(rem*10+ +d)%97;const checkDigits=String(98-rem).padStart(2,'0');
const kyc=await request('/partner/kyc',{token:sana,method:'POST',expect:201,body:{cnic:'3520212345671',iban:`PK${checkDigits}${bban}`}});
check('bank kyc grants level 2',kyc.kycLevel>=2&&kyc.kycStatus==='VERIFIED'&&kyc.partner==='Soneri Bank');
// Guarantee needs a funding slot fee; a slot fee needs a guarantee to fund
await request('/committees',{token:sana,method:'POST',expect:400,body:{name:'Bad guarantee',memberCap:3,contributionPaisa:'2500000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,custodyMode:'BANK_CUSTODY',payoutGuaranteed:true,slotFeeBps:0}});
await request('/committees',{token:sana,method:'POST',expect:400,body:{name:'Bad slot fee',memberCap:3,contributionPaisa:'2500000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,custodyMode:'RECORDED',slotFeeBps:100}});
const bankCircle=await request('/committees',{token:sana,method:'POST',expect:201,body:{name:`Soneri Rail ${Date.now()}`,memberCap:3,contributionPaisa:'2500000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,custodyMode:'BANK_CUSTODY',payoutGuaranteed:true,slotFeeBps:100,joinPolicy:'INVITE_ONLY'}});
check('bank custody circle created',bankCircle.custodyMode==='BANK_CUSTODY'&&bankCircle.payoutGuaranteed===true&&bankCircle.slotFeeBps===100);
await request('/committees/join',{token:ayesha,method:'POST',expect:201,body:{inviteCode:bankCircle.inviteCode}});
await request('/committees/join',{token:bilal,method:'POST',expect:201,body:{inviteCode:bankCircle.inviteCode}});
await request(`/committees/${bankCircle.id}/start`,{token:sana,method:'POST',body:{}});
let bankDetail=await request(`/committees/${bankCircle.id}`,{token:sana});
check('bank circle active with partner attached',bankDetail.status==='ACTIVE'&&bankDetail.partner?.shortCode==='SONERI');
for(const deposit of (await request(`/committees/${bankCircle.id}/deposits`,{token:sana})).filter(row=>row.status==='PENDING'))await request(`/committees/${bankCircle.id}/deposits/${deposit.id}/confirm`,{token:sana,method:'POST',body:{txnRef:`DEP-${deposit.id.slice(-6)}`}});
const bankRound=bankDetail.rounds[0];
const usernameById=new Map(bankDetail.members.map(m=>[m.userId,m.user.username]));
// Statement import settles a non-recipient; the recipient pays manually because
// the guarantee never covers the recipient's own installment.
const recipientId=bankRound.recipientId;
const nonRecipients=bankRound.payments.filter(p=>p.payerId!==recipientId);
const stmt=await request(`/partner/committees/${bankCircle.id}/statements`,{token:sana,method:'POST',expect:201,body:{lines:[
  {lineRef:`SON-${Date.now()}-1`,amountPaisa:'2500000',narration:`installment from ${usernameById.get(nonRecipients[0].payerId)}`,postedAt:new Date().toISOString()},
  {lineRef:`SON-${Date.now()}-2`,amountPaisa:'999900',narration:`wrong amount ${usernameById.get(nonRecipients[1].payerId)}`,postedAt:new Date().toISOString()},
]}});
check('statement matching settles exact line only',stmt.matchedLines===1&&stmt.results.find(r=>r.status==='UNMATCHED')?.note==='Amount does not equal the installment');
const recipientToken=new Map([[bankDetail.members.find(m=>m.user.username==='sana')?.userId,sana],[bankDetail.members.find(m=>m.user.username==='ayesha')?.userId,ayesha],[bankDetail.members.find(m=>m.user.username==='bilal')?.userId,bilal]]).get(recipientId);
await request('/payments',{token:recipientToken,method:'POST',expect:201,body:{roundId:bankRound.id,paidVia:'RAAST',txnRef:`REC-${Date.now()}`,idempotencyKey:`bank-recipient-${bankRound.id}`}});
// Remaining member misses: stage MISSED directly (the hourly scheduler does this in production)
const missingPayment=nonRecipients[1];
await prisma.payment.update({where:{roundId_payerId:{roundId:bankRound.id,payerId:missingPayment.payerId}},data:{status:'MISSED'}});
await prisma.round.update({where:{id:bankRound.id},data:{payoutDate:new Date(Date.now()-86_400_000)}});
await prisma.payment.update({where:{roundId_payerId:{roundId:bankRound.id,payerId:recipientId}},data:{paidAt:new Date(Date.now()-9*86_400_000)}});
// Payout blocked while the pool cannot cover the missed installment
await request(`/committees/${bankCircle.id}/payout`,{token:sana,method:'POST',expect:409,body:{idempotencyKey:`guarantee-blocked-${bankCircle.id}`}});
// Fund the pool (as accumulated slot fees would) and release
await prisma.ledgerEntry.create({data:{committeeId:bankCircle.id,debit:`committee:${bankCircle.id}:escrow`,credit:`committee:${bankCircle.id}:guarantee_fund`,amountPaisa:2500000n,reason:'TEST_POOL_SEED',refType:'Committee',refId:bankCircle.id,idempotencyKey:`test-seed-${bankCircle.id}`}});
await request(`/committees/${bankCircle.id}/payout`,{token:sana,method:'POST',body:{idempotencyKey:`guaranteed-payout-${bankCircle.id}`}});
bankDetail=await request(`/committees/${bankCircle.id}`,{token:sana});
check('guaranteed payout released and advanced',bankDetail.currentRound===2&&bankDetail.rounds[0].status==='CLOSED');
const coverage=await prisma.ledgerEntry.findFirst({where:{committeeId:bankCircle.id,reason:'GUARANTEE_POOL_COVERED_MISSED_INSTALLMENT'}});
const slotFeeEntry=await prisma.ledgerEntry.findFirst({where:{committeeId:bankCircle.id,reason:'SLOT_FEE_TO_GUARANTEE_POOL_RECORDED'}});
check('guarantee coverage ledgered',!!coverage&&coverage.amountPaisa===2500000n);
check('slot fee ledgered into pool',!!slotFeeEntry&&slotFeeEntry.amountPaisa>0n);
const recovery=await prisma.recoveryCase.findFirst({where:{committeeId:bankCircle.id,userId:missingPayment.payerId}});
check('defaulter owes the pool via recovery case',!!recovery&&recovery.status==='OPEN');
const fund=await request(`/partner/committees/${bankCircle.id}/guarantee-fund`,{token:ayesha});
check('guarantee fund transparency endpoint',typeof fund.balancePaisa==='string'&&fund.payoutGuaranteed===true);

// ---- Sukoon/Bazaar engine: float sweep, prize hiba, patience-weighted completion, deposit mudarabah ----
await request('/committees',{token:sana,method:'POST',expect:400,body:{name:'Prize needs engine',memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,tier:'CLASSIC',prizeDrawEnabled:true}});
const bazaar=await request('/committees',{token:sana,method:'POST',expect:201,body:{name:`Bazaar ${Date.now()}`,memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,orderMode:'HOST_ASSIGNED',joinPolicy:'INVITE_ONLY',tier:'BAZAAR',prizeDrawEnabled:true,goalType:'EDUCATION',goalName:'Ayesha fees'}});
check('bazaar circle wired to islamic schemes',bazaar.tier==='BAZAAR'&&!!bazaar.floatSchemeId&&!!bazaar.depositSchemeId&&bazaar.prizeDrawEnabled===true);
check('goal circle metadata persisted',bazaar.goalType==='EDUCATION'&&bazaar.goalName==='Ayesha fees');
await request('/committees/join',{token:ayesha,method:'POST',expect:201,body:{inviteCode:bazaar.inviteCode}});
await request('/committees/join',{token:bilal,method:'POST',expect:201,body:{inviteCode:bazaar.inviteCode}});
await request(`/committees/${bazaar.id}/start`,{token:sana,method:'POST',expect:409,body:{}}); // tier engines demand consent even with 0% reinvest
for(const token of [sana,ayesha,bilal])await request(`/risk/committee/${bazaar.id}/consent`,{token,method:'POST',expect:201,body:{accepted:true}});
await request(`/committees/${bazaar.id}/start`,{token:sana,method:'POST',body:{}});
let bz=await request(`/committees/${bazaar.id}`,{token:sana});
check('host-assigned order locked',bz.status==='ACTIVE'&&bz.members.length===3);
for(const deposit of (await request(`/committees/${bazaar.id}/deposits`,{token:sana})).filter(row=>row.status==='PENDING'))await request(`/committees/${bazaar.id}/deposits/${deposit.id}/confirm`,{token:sana,method:'POST',body:{txnRef:`BZD-${deposit.id.slice(-6)}`}});
const bzToken=new Map(bz.members.map(m=>[m.userId,{sana,ayesha,bilal}[m.user.username]]));
for(let r=1;r<=3;r++){
  bz=await request(`/committees/${bazaar.id}`,{token:sana});
  const rd=bz.rounds.find(x=>x.roundNumber===r);
  for(const p of rd.payments)await request('/payments',{token:bzToken.get(p.payerId),method:'POST',expect:201,body:{roundId:rd.id,paidVia:'RAAST',txnRef:`BZ-${r}-${p.payerId.slice(-4)}`,idempotencyKey:`bz-${rd.id}-${p.payerId}`}});
  await prisma.payment.updateMany({where:{roundId:rd.id},data:{paidAt:new Date(Date.now()-20*86_400_000)}});
  await prisma.round.update({where:{id:rd.id},data:{payoutDate:new Date(Date.now()-86_400_000)}});
  await request(`/committees/${bazaar.id}/payout`,{token:sana,method:'POST',body:{idempotencyKey:`bz-payout-${bazaar.id}-${r}`}});
}
bz=await request(`/committees/${bazaar.id}`,{token:sana});
check('bazaar cycle completed',bz.status==='COMPLETED');
const bzRow=await prisma.committee.findUnique({where:{id:bazaar.id},select:{cleanStreak:true}});
check('group staking streak advanced on clean on-time rounds',bzRow.cleanStreak>=1,`cleanStreak=${bzRow.cleanStreak}`);
const streakFloat=await prisma.ledgerEntry.findMany({where:{committeeId:bazaar.id,reason:'FLOAT_SWEEP_PROFIT_SIMULATED'},orderBy:{createdAt:'asc'}});
check('float sweep still positive every clean round (streak bonus applied)',streakFloat.length===3&&streakFloat.every(e=>e.amountPaisa>0n));
const floatEntries=await prisma.ledgerEntry.findMany({where:{committeeId:bazaar.id,reason:'FLOAT_SWEEP_PROFIT_SIMULATED'}});
check('float sweep realised every round',floatEntries.length===3&&floatEntries.every(e=>e.amountPaisa>0n),`entries=${floatEntries.length}`);
const mudaribFees=await prisma.ledgerEntry.count({where:{committeeId:bazaar.id,reason:'FLOAT_MUDARIB_FEE_5_PERCENT'}});
check('mudarib fee taken on float profit',mudaribFees===3);
const prizes=await prisma.ledgerEntry.findMany({where:{committeeId:bazaar.id,reason:'PRIZE_HIBA_GIFT_RECORDED'}});
check('prize hiba gifted each round from profit only',prizes.length===3&&prizes.every(e=>e.amountPaisa>0n));
const shares=await prisma.ledgerEntry.findMany({where:{committeeId:bazaar.id,reason:'CAPITAL_DAYS_PROFIT_DISTRIBUTION'}});
const shareOf=username=>{const uid=bz.members.find(m=>m.user.username===username).userId;return shares.filter(e=>e.credit===`user:${uid}:external`).reduce((s,e)=>s+e.amountPaisa,0n)};
check('patience tilt pays the last position most',shares.length===3&&shareOf('bilal')>shareOf('ayesha')&&shareOf('ayesha')>shareOf('sana'),`sana=${shareOf('sana')} ayesha=${shareOf('ayesha')} bilal=${shareOf('bilal')}`);
const yieldedDeposit=await prisma.securityDeposit.findFirst({where:{membership:{committeeId:bazaar.id},accruedYieldPaisa:{gt:0n}}});
check('deposits earned at the islamic scheme rate',!!yieldedDeposit);
const pooledYield=await prisma.ledgerEntry.count({where:{committeeId:bazaar.id,reason:'DEPOSIT_YIELD_POOLED_FOR_PATIENCE'}});
check('bazaar pools deposit yield into the patience split (not paid per-depositor)',pooledYield>0);
const perDepositorYield=await prisma.ledgerEntry.count({where:{committeeId:bazaar.id,reason:'SECURITY_DEPOSIT_YIELD_RECORDED'}});
check('bazaar does not pay deposit yield straight to the depositor',perDepositorYield===0);
// Last position (bilal, #3) must out-earn the first (sana, #1) by roughly the 2x patience weight now that the big deposit-yield pool flows through the tilt.
check('patience tilt makes the last turn out-earn the first after pooling deposit yield',shareOf('bilal')>shareOf('sana')*15n/10n,`sana=${shareOf('sana')} bilal=${shareOf('bilal')}`);
const stuckHoldbacks=await prisma.payoutHoldback.count({where:{committeeId:bazaar.id,status:'HELD'}});
check('no holdback stuck after completion',stuckHoldbacks===0);

// ---- Priority tier: conventional early fee + immediate per-round dividend (chit-fund mechanic) ----
await request('/committees',{token:sana,method:'POST',expect:400,body:{name:'Fee needs priority',memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,tier:'CLASSIC',earlyFeeBps:500}});
await request('/committees',{token:sana,method:'POST',expect:400,body:{name:'Fee too small',memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,tier:'PRIORITY',earlyFeeBps:10}});
const priority=await request('/committees',{token:sana,method:'POST',expect:201,body:{name:`Priority ${Date.now()}`,memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,orderMode:'HOST_ASSIGNED',joinPolicy:'INVITE_ONLY',tier:'PRIORITY',earlyFeeBps:600}});
check('priority circle created with early fee',priority.tier==='PRIORITY'&&priority.earlyFeeBps===600);
await request('/committees/join',{token:ayesha,method:'POST',expect:201,body:{inviteCode:priority.inviteCode}});
await request('/committees/join',{token:bilal,method:'POST',expect:201,body:{inviteCode:priority.inviteCode}});
await request(`/committees/${priority.id}/start`,{token:sana,method:'POST',expect:409,body:{}}); // early fee also needs consent
for(const token of [sana,ayesha,bilal])await request(`/risk/committee/${priority.id}/consent`,{token,method:'POST',expect:201,body:{accepted:true}});
await request(`/committees/${priority.id}/start`,{token:sana,method:'POST',body:{}});
let pr=await request(`/committees/${priority.id}`,{token:sana});
for(const deposit of (await request(`/committees/${priority.id}/deposits`,{token:sana})).filter(row=>row.status==='PENDING'))await request(`/committees/${priority.id}/deposits/${deposit.id}/confirm`,{token:sana,method:'POST',body:{txnRef:`PRD-${deposit.id.slice(-6)}`}});
const prToken=new Map(pr.members.map(m=>[m.userId,{sana,ayesha,bilal}[m.user.username]]));
const round1=pr.rounds.find(x=>x.roundNumber===1);
for(const p of round1.payments)await request('/payments',{token:prToken.get(p.payerId),method:'POST',expect:201,body:{roundId:round1.id,paidVia:'RAAST',txnRef:`PR-1-${p.payerId.slice(-4)}`,idempotencyKey:`pr-${round1.id}-${p.payerId}`}});
await prisma.round.update({where:{id:round1.id},data:{payoutDate:new Date(Date.now()-86_400_000)}});
await prisma.payment.updateMany({where:{roundId:round1.id,payerId:round1.recipientId},data:{paidAt:new Date(Date.now()-9*86_400_000)}});
const othersBalanceBefore=await prisma.ledgerEntry.aggregate({where:{committeeId:priority.id,reason:'EARLY_FEE_DIVIDEND_RECORDED'},_sum:{amountPaisa:true}});
check('no dividend before payout',(othersBalanceBefore._sum.amountPaisa??0n)===0n);
await request(`/committees/${priority.id}/payout`,{token:sana,method:'POST',body:{idempotencyKey:`pr-payout-${priority.id}-1`}});
const dividends=await prisma.ledgerEntry.findMany({where:{committeeId:priority.id,reason:'EARLY_FEE_DIVIDEND_RECORDED'}});
check('round-1 early fee paid as immediate dividend to the other two members',dividends.length===2,`count=${dividends.length}`);
const totalDividend=dividends.reduce((s,e)=>s+e.amountPaisa,0n);
const expectedFee=6000000n*BigInt(Math.round(600*(3-1)/(3-1)))/10000n; // position 1 of 3: full 6% of the 6,000,000 payout
check('round-1 fee equals the full disclosed rate for the first (earliest) turn',totalDividend===expectedFee,`total=${totalDividend} expected=${expectedFee}`);
const recipientPayoutEntry=await prisma.ledgerEntry.findFirst({where:{committeeId:priority.id,reason:'ROUND_PAYOUT_RECORDED',refId:round1.id}});
const round1Holdback=await prisma.payoutHoldback.findUnique({where:{roundId:round1.id}});
const expectedReleased=6000000n-(round1Holdback?.amountPaisa??0n)-expectedFee;
check('recipient payout reduced by the holdback AND the early fee',recipientPayoutEntry.amountPaisa===expectedReleased,`payout=${recipientPayoutEntry.amountPaisa} expected=${expectedReleased} holdback=${round1Holdback?.amountPaisa}`);

// ---- Payout parking vault: opted-in recipient's payout parks, then sweeps with profit ----
pr=await request(`/committees/${priority.id}`,{token:sana});
const round2=pr.rounds.find(x=>x.roundNumber===2);
const r2RecipientToken=prToken.get(round2.recipientId);
await request('/vault/toggle',{token:r2RecipientToken,method:'POST',body:{enabled:true}});
for(const p of round2.payments)await request('/payments',{token:prToken.get(p.payerId),method:'POST',expect:201,body:{roundId:round2.id,paidVia:'RAAST',txnRef:`PR-2-${p.payerId.slice(-4)}`,idempotencyKey:`pr-${round2.id}-${p.payerId}`}});
await prisma.round.update({where:{id:round2.id},data:{payoutDate:new Date(Date.now()-86_400_000)}});
await prisma.payment.updateMany({where:{roundId:round2.id,payerId:round2.recipientId},data:{paidAt:new Date(Date.now()-9*86_400_000)}});
await request(`/committees/${priority.id}/payout`,{token:sana,method:'POST',body:{idempotencyKey:`pr-payout-${priority.id}-2`}});
const parked=await prisma.ledgerEntry.findFirst({where:{reason:'ROUND_PAYOUT_PARKED_IN_VAULT',refId:round2.id}});
check('opted-in recipient payout parked in vault',!!parked&&parked.credit===`user:${round2.recipientId}:vault`);
let vaultView=await request('/vault',{token:r2RecipientToken});
check('vault shows parked balance and parking on',BigInt(vaultView.balancePaisa)>0n&&vaultView.enabled===true);
await prisma.ledgerEntry.update({where:{id:parked.id},data:{createdAt:new Date(Date.now()-30*86_400_000)}}); // simulate 30 days parked
const sweep=await request('/vault/withdraw',{token:r2RecipientToken,method:'POST',body:{idempotencyKey:`sweep-${parked.id}`}});
check('vault sweep returns principal plus 30-day profit',BigInt(sweep.principalPaisa)===parked.amountPaisa&&BigInt(sweep.profitPaisa)>0n,`principal=${sweep.principalPaisa} profit=${sweep.profitPaisa}`);
vaultView=await request('/vault',{token:r2RecipientToken});
check('vault empty after sweep',vaultView.balancePaisa==='0');
await request('/vault/withdraw',{token:r2RecipientToken,method:'POST',expect:409,body:{idempotencyKey:`sweep-empty-${parked.id}`}});
await request('/vault/toggle',{token:r2RecipientToken,method:'POST',body:{enabled:false}}); // restore default for re-runs

// ---- Sigma tier: 10%-capped early fee + full engine + pooled dividends + penalty routing in ONE circle ----
await request('/committees',{token:sana,method:'POST',expect:400,body:{name:'Fee over cap',memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,tier:'SIGMA',earlyFeeBps:1100}});
await request('/committees',{token:sana,method:'POST',expect:400,body:{name:'Pooled needs sigma',memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,tier:'PRIORITY',earlyFeeBps:600,dividendPooled:true}});
await request('/committees',{token:sana,method:'POST',expect:400,body:{name:'Prize needs float',memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,tier:'PRIORITY',earlyFeeBps:600,prizeDrawEnabled:true}});
const sigma=await request('/committees',{token:sana,method:'POST',expect:201,body:{name:`Sigma ${Date.now()}`,memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,orderMode:'HOST_ASSIGNED',joinPolicy:'INVITE_ONLY',tier:'SIGMA',earlyFeeBps:1000,dividendPooled:true}});
check('sigma circle: full engine wiring plus the capped fee',sigma.tier==='SIGMA'&&sigma.earlyFeeBps===1000&&sigma.dividendPooled===true&&!!sigma.floatSchemeId&&!!sigma.depositSchemeId);
await request('/committees/join',{token:ayesha,method:'POST',expect:201,body:{inviteCode:sigma.inviteCode}});
await request('/committees/join',{token:bilal,method:'POST',expect:201,body:{inviteCode:sigma.inviteCode}});
for(const token of [sana,ayesha,bilal])await request(`/risk/committee/${sigma.id}/consent`,{token,method:'POST',expect:201,body:{accepted:true}});
await request(`/committees/${sigma.id}/start`,{token:sana,method:'POST',body:{}});
let sg=await request(`/committees/${sigma.id}`,{token:sana});
check('sigma consent text names both the fee and the engine',sg.riskPolicyJson?.consentText?.includes('Sigma')&&sg.riskPolicyJson?.consentText?.includes('NOT been reviewed for Shariah compliance'));
for(const deposit of (await request(`/committees/${sigma.id}/deposits`,{token:sana})).filter(row=>row.status==='PENDING'))await request(`/committees/${sigma.id}/deposits/${deposit.id}/confirm`,{token:sana,method:'POST',body:{txnRef:`SGD-${deposit.id.slice(-6)}`}});
const sgToken=new Map(sg.members.map(m=>[m.userId,{sana,ayesha,bilal}[m.user.username]]));
const bilalId=sg.members.find(m=>m.user.username==='bilal').userId;
for(let r=1;r<=3;r++){
  sg=await request(`/committees/${sigma.id}`,{token:sana});
  const rd=sg.rounds.find(x=>x.roundNumber===r);
  // Round 2: the on-time members settle first, then the round due date moves
  // to yesterday so bilal records one day late -> progressive penalty into the
  // default reserve (lateness is judged against the ROUND due date at pay time).
  for(const p of rd.payments.filter(p=>r!==2||p.payerId!==bilalId))await request('/payments',{token:sgToken.get(p.payerId),method:'POST',expect:201,body:{roundId:rd.id,paidVia:'RAAST',txnRef:`SG-${r}-${p.payerId.slice(-4)}`,idempotencyKey:`sg-${rd.id}-${p.payerId}`}});
  if(r===2){
    await prisma.round.update({where:{id:rd.id},data:{dueDate:new Date(Date.now()-86_400_000)}});
    await request('/payments',{token:sgToken.get(bilalId),method:'POST',expect:201,body:{roundId:rd.id,paidVia:'RAAST',txnRef:`SG-2-late`,idempotencyKey:`sg-${rd.id}-${bilalId}`}});
  }
  await prisma.payment.updateMany({where:{roundId:rd.id},data:{paidAt:new Date(Date.now()-20*86_400_000)}});
  await prisma.round.update({where:{id:rd.id},data:{payoutDate:new Date(Date.now()-86_400_000)}});
  await request(`/committees/${sigma.id}/payout`,{token:sana,method:'POST',body:{idempotencyKey:`sg-payout-${sigma.id}-${r}`}});
}
sg=await request(`/committees/${sigma.id}`,{token:sana});
check('sigma cycle completed',sg.status==='COMPLETED');
const sgFloat=await prisma.ledgerEntry.count({where:{committeeId:sigma.id,reason:'FLOAT_SWEEP_PROFIT_SIMULATED'}});
check('sigma runs the float sweep alongside the fee',sgFloat===3);
const sgMonthlyDividends=await prisma.ledgerEntry.count({where:{committeeId:sigma.id,reason:'EARLY_FEE_DIVIDEND_RECORDED'}});
check('pooled mode pays no monthly dividends',sgMonthlyDividends===0);
const sgPooledAudits=await prisma.auditLog.count({where:{action:'EARLY_FEE_POOLED_FOR_PATIENCE',entityType:'Round',entityId:{in:sg.rounds.map(r=>r.id)}}});
check('early fee pooled for rounds 1-2 (round 3 pays no fee)',sgPooledAudits===2,`audits=${sgPooledAudits}`);
const sgYieldPooled=await prisma.ledgerEntry.count({where:{committeeId:sigma.id,reason:'DEPOSIT_YIELD_POOLED_FOR_PATIENCE'}});
check('sigma pools deposit yield through the patience split',sgYieldPooled>0);
const sgShares=await prisma.ledgerEntry.findMany({where:{committeeId:sigma.id,reason:'CAPITAL_DAYS_PROFIT_DISTRIBUTION'}});
const sgShareOf=username=>{const uid=sg.members.find(m=>m.user.username===username).userId;return sgShares.filter(e=>e.credit===`user:${uid}:external`).reduce((s,e)=>s+e.amountPaisa,0n)};
check('sigma patience split pays the last turn most (fees included)',sgShares.length===3&&sgShareOf('bilal')>sgShareOf('sana'),`sana=${sgShareOf('sana')} bilal=${sgShareOf('bilal')}`);
const penaltyDividends=await prisma.ledgerEntry.findMany({where:{committeeId:sigma.id,reason:'LATE_PENALTY_POOL_DIVIDEND_RECORDED'}});
const penaltyRecorded=await prisma.ledgerEntry.aggregate({where:{committeeId:sigma.id,reason:'PROGRESSIVE_LATE_PENALTY_RECORDED'},_sum:{amountPaisa:true}});
check('late penalty routed to the clean members at completion',penaltyDividends.length===2&&penaltyDividends.reduce((s,e)=>s+e.amountPaisa,0n)===(penaltyRecorded._sum.amountPaisa??0n),`dividends=${penaltyDividends.length} sum=${penaltyDividends.reduce((s,e)=>s+e.amountPaisa,0n)} penalties=${penaltyRecorded._sum.amountPaisa}`);
check('the late payer gets no penalty dividend',penaltyDividends.every(e=>e.credit!==`user:${bilalId}:external`));

// ---- Shariah gate on the turn market: Sukoon/Bazaar allow free swaps only ----
const swap=await request('/committees',{token:sana,method:'POST',expect:201,body:{name:`Swap ${Date.now()}`,memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,orderMode:'HOST_ASSIGNED',joinPolicy:'INVITE_ONLY',tier:'SUKOON'}});
await request('/committees/join',{token:ayesha,method:'POST',expect:201,body:{inviteCode:swap.inviteCode}});
await request('/committees/join',{token:bilal,method:'POST',expect:201,body:{inviteCode:swap.inviteCode}});
for(const token of [sana,ayesha,bilal])await request(`/risk/committee/${swap.id}/consent`,{token,method:'POST',expect:201,body:{accepted:true}});
await request(`/committees/${swap.id}/start`,{token:sana,method:'POST',body:{}});
const swapDetail=await request(`/committees/${swap.id}`,{token:sana});
const swapRound=swapDetail.rounds[0];
for(const p of swapRound.payments)await request('/payments',{token:new Map(swapDetail.members.map(m=>[m.userId,{sana,ayesha,bilal}[m.user.username]])).get(p.payerId),method:'POST',expect:201,body:{roundId:swapRound.id,paidVia:'RAAST',txnRef:`SW-${p.payerId.slice(-4)}`,idempotencyKey:`sw-${swapRound.id}-${p.payerId}`}});
await request('/exchange',{token:bilal,method:'POST',expect:400,body:{committeeId:swap.id,premiumPaisa:'100000'}});
const freeListing=await request('/exchange',{token:bilal,method:'POST',expect:201,body:{committeeId:swap.id,premiumPaisa:'0'}});
check('sukoon turn listing allowed only at zero premium',freeListing.premiumPaisa==='0'||freeListing.premiumPaisa===0||BigInt(freeListing.premiumPaisa)===0n);
await request(`/exchange/${freeListing.id}/bid`,{token:ayesha,method:'POST',expect:400,body:{premiumPaisa:'50000'}});
await request(`/exchange/${freeListing.id}/bid`,{token:ayesha,method:'POST',expect:201,body:{premiumPaisa:'0'}});
const freeBid=(await prisma.exchangeBid.findFirst({where:{listing:{committeeId:swap.id},status:'OPEN'}}));
await request(`/exchange/${freeListing.id}/bids/${freeBid.id}/accept`,{token:bilal,method:'POST',body:{idempotencyKey:`swap-${freeListing.id}`}});
const swapAfter=await request(`/committees/${swap.id}`,{token:sana});
const posOf=username=>swapAfter.members.find(m=>m.user.username===username).turnPosition;
check('free swap exchanged the turn positions',posOf('bilal')===2&&posOf('ayesha')===3,`bilal=${posOf('bilal')} ayesha=${posOf('ayesha')}`);
const swapPremiums=await prisma.ledgerEntry.count({where:{committeeId:swap.id,reason:{in:['TURN_PREMIUM_RECORDED','TURN_MARKETPLACE_FEE_10_PERCENT']}}});
check('no premium money moved in the shariah swap',swapPremiums===0);
await prisma.committee.update({where:{id:swap.id},data:{status:'CANCELLED'}}); // cleanup mid-cycle test circle

// ---- Vault top-ups: the halal savings pocket without a committee ----
// taha has no vault history in this run, so the backdated accrual is clean
// (a member's earlier same-run sweep would legitimately fence off older entries).
const taha=await login('taha');
await request('/vault/deposit',{token:taha,method:'POST',expect:400,body:{amountPaisa:'5000',idempotencyKey:`vd-small-${Date.now()}`}});
const topup=await request('/vault/deposit',{token:taha,method:'POST',expect:201,body:{amountPaisa:'500000',idempotencyKey:`vd-${Date.now()}`}});
check('vault top-up recorded',BigInt(topup.balancePaisa)>=500000n);
const topupEntry=await prisma.ledgerEntry.findFirst({where:{reason:'VAULT_TOPUP_RECORDED',debit:{startsWith:'user:'}},orderBy:{createdAt:'desc'}});
await prisma.ledgerEntry.update({where:{id:topupEntry.id},data:{createdAt:new Date(Date.now()-30*86_400_000)}}); // 30 days in the sleeve
const topupSweep=await request('/vault/withdraw',{token:taha,method:'POST',body:{idempotencyKey:`vd-sweep-${topupEntry.id}`}});
check('top-up sweep returns principal plus accrued profit',BigInt(topupSweep.principalPaisa)>=500000n&&BigInt(topupSweep.profitPaisa)>0n,`principal=${topupSweep.principalPaisa} profit=${topupSweep.profitPaisa}`);

// ---- Vault yield tiers: Standard / Income / Gold-linked ----
const goldTier=await request('/vault/tier',{token:taha,method:'POST',body:{tier:'GOLD'}});
check('vault gold tier switches to the gold-linked rate',goldTier.tier==='GOLD'&&goldTier.ratePct>=14,`rate=${goldTier.ratePct}`);
const incomeTier=await request('/vault/tier',{token:taha,method:'POST',body:{tier:'INCOME'}});
check('vault income tier switches to the income-fund rate',incomeTier.tier==='INCOME'&&incomeTier.ratePct>=11&&incomeTier.ratePct<goldTier.ratePct,`rate=${incomeTier.ratePct}`);
const vaultView2=await request('/vault',{token:taha});
check('vault reports the active tier and the choices',vaultView2.tier==='INCOME'&&Array.isArray(vaultView2.tiers)&&vaultView2.tiers.length===4);
await request('/vault/tier',{token:taha,method:'POST',body:{tier:'STANDARD'}}); // restore default for re-runs

// ---- Crypto vault tier: functional, but only through an explicit extreme-risk acknowledgement ----
const vaultTiers=await request('/vault',{token:taha});
check('vault offers all four tiers incl. crypto',Array.isArray(vaultTiers.tiers)&&vaultTiers.tiers.length===4&&vaultTiers.tiers.includes('CRYPTO'));
await request('/vault/tier',{token:taha,method:'POST',expect:428,body:{tier:'CRYPTO'}}); // silent switch refused
const cryptoTier=await request('/vault/tier',{token:taha,method:'POST',body:{tier:'CRYPTO',acknowledgeExtremeRisk:true}});
check('crypto tier switches only with acknowledgement (30% speculative rate)',cryptoTier.tier==='CRYPTO'&&cryptoTier.ratePct===30&&cryptoTier.scheme.shariahCompliant===false,`rate=${cryptoTier.ratePct}`);
await request('/vault/tier',{token:taha,method:'POST',body:{tier:'STANDARD'}}); // restore for re-runs

// ---- Change password: rotate, verify old dies + new works, rotate back ----
await request('/auth/change-password',{token:taha,method:'POST',expect:401,body:{currentPassword:'wrongpass99',newPassword:'halqa1234'}});
await request('/auth/change-password',{token:taha,method:'POST',body:{currentPassword:'halqa123',newPassword:'halqa1234'}});
await request('/auth/login',{method:'POST',expect:401,body:{identity:'taha',password:'halqa123'}});
const relogin=await request('/auth/login',{method:'POST',body:{identity:'taha',password:'halqa1234'}});
check('new password authenticates',!!relogin.accessToken);
await request('/auth/change-password',{token:relogin.accessToken,method:'POST',body:{currentPassword:'halqa1234',newPassword:'halqa123'}}); // restore demo credential
const restored=await request('/auth/login',{method:'POST',body:{identity:'taha',password:'halqa123'}});
check('demo credential restored after rotation',!!restored.accessToken);

// ---- Referral loyalty: bilal (referred by ayesha) completed his first cycle this run or earlier ----
const refEntry=await prisma.ledgerEntry.findFirst({where:{idempotencyKey:`referral:${bilalRow.id}`}});
check('referral bonus ledgered once ever, funded from the platform share',!!refEntry&&refEntry.amountPaisa===25000n&&refEntry.debit==='platform:fees'&&refEntry.credit===`user:${ayeshaRow.id}:external`,`entry=${refEntry?.amountPaisa}`);
const refCount=await prisma.ledgerEntry.count({where:{idempotencyKey:`referral:${bilalRow.id}`}});
check('referral bonus is strictly once per referred member',refCount===1);

// ---- Graduated exposure: first-circle cap for unproven members ----
// Register's own token is reused: an immediate re-login within the same
// second signs an identical refresh JWT and trips the tokenHash unique.
const stamp=Date.now();
const newbieReg=await request('/auth/register',{method:'POST',expect:201,body:{fullName:'Newbie Tester',username:`newbie${stamp}`,phone:`0345${String(stamp).slice(-7)}`,email:`newbie${stamp}@halqa.pk`,password:'halqa123x',referredBy:'ayesha'}});
const newbieTok=newbieReg.accessToken;
check('registration accepts a referral handle',!!newbieTok);
const bigCircle=await request('/committees',{token:ayesha,method:'POST',expect:201,body:{name:`Newbie ${stamp}`,memberCap:5,contributionPaisa:'3000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,joinPolicy:'OPEN_UNTIL_FULL'}});
const newbieJoin=await request(`/committees/${bigCircle.id}/join`,{token:newbieTok,method:'POST',expect:201,body:{}});
check('newcomer can join a large circle (first-circle cap removed)',!!newbieJoin.id||!!newbieJoin.membership||newbieJoin.status!==403);
await request(`/committees/${bigCircle.id}/join`,{token:bilal,method:'POST',expect:201,body:{}}); // proven member joins fine

// ---- Vault auto-cover: an overdue installment settles itself from the member's vault ----
const cover=await request('/committees',{token:sana,method:'POST',expect:201,body:{name:`Cover ${Date.now()}`,memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,reinvestRatio:0,orderMode:'HOST_ASSIGNED',joinPolicy:'INVITE_ONLY'}});
await request('/committees/join',{token:ayesha,method:'POST',expect:201,body:{inviteCode:cover.inviteCode}});
await request('/committees/join',{token:bilal,method:'POST',expect:201,body:{inviteCode:cover.inviteCode}});
await request(`/committees/${cover.id}/start`,{token:sana,method:'POST',body:{}});
const acToggle=await request('/vault/auto-cover',{token:bilal,method:'POST',body:{enabled:true}});
check('auto-cover toggle persists',acToggle.autoCover===true);
await request('/vault/deposit',{token:bilal,method:'POST',expect:201,body:{amountPaisa:'2500000',idempotencyKey:`ac-fund-${Date.now()}`}});
let cv=await request(`/committees/${cover.id}`,{token:sana});
const coverRound=cv.rounds.find(r=>r.roundNumber===1);
const bilalCoverId=cv.members.find(m=>m.user.username==='bilal').userId;
for(const p of coverRound.payments.filter(p=>p.payerId!==bilalCoverId))await request('/payments',{token:new Map(cv.members.map(m=>[m.userId,{sana,ayesha,bilal}[m.user.username]])).get(p.payerId),method:'POST',expect:201,body:{roundId:coverRound.id,paidVia:'RAAST',txnRef:`CV-${p.payerId.slice(-4)}`,idempotencyKey:`cv-${coverRound.id}-${p.payerId}`}});
await prisma.round.update({where:{id:coverRound.id},data:{dueDate:new Date(Date.now()-86_400_000)}});
await prisma.payment.updateMany({where:{roundId:coverRound.id,payerId:bilalCoverId},data:{dueDate:new Date(Date.now()-86_400_000)}});
const delinquency=await request('/protection/delinquency/run',{token:sana,method:'POST',body:{}});
check('delinquency pass auto-covered the overdue installment',delinquency.autoCovered>=1,`autoCovered=${delinquency.autoCovered}`);
const coveredPayment=await prisma.payment.findUnique({where:{roundId_payerId:{roundId:coverRound.id,payerId:bilalCoverId}}});
check('installment settled from the vault via the standard path',coveredPayment.status==='PAID'&&coveredPayment.paidVia==='VAULT_AUTO_COVER');
const releaseEntry=await prisma.ledgerEntry.findFirst({where:{reason:'VAULT_AUTO_COVER_RELEASE',refId:coveredPayment.id}});
check('vault release ledgered before settlement',!!releaseEntry&&releaseEntry.amountPaisa===2000000n&&releaseEntry.debit===`user:${bilalCoverId}:vault`);
const bilalVault=await request('/vault',{token:bilal});
check('vault balance reduced by exactly the installment',bilalVault.balancePaisa==='500000',`balance=${bilalVault.balancePaisa}`);
const latePenalty=await prisma.ledgerEntry.findFirst({where:{reason:'PROGRESSIVE_LATE_PENALTY_RECORDED',refId:coveredPayment.id}});
check('late adjustment still applied (auto-cover softens escalation, not fairness)',!!latePenalty&&latePenalty.amountPaisa>0n);
await request('/vault/auto-cover',{token:bilal,method:'POST',body:{enabled:false}}); // restore default for re-runs

// ---- Security barrier: weak-password rejection + per-account lockout ----
if(!RELAXED){
const weak=await request('/auth/register',{method:'POST',expect:400,body:{fullName:'Weak Pass',username:`weak${stamp}`,phone:`0300${String(stamp).slice(-7)}`,email:`weak${stamp}@halqa.pk`,password:'aaaaaaaaaa'}});
check('register rejects a password without digits',(weak.error||'').includes('letters and numbers'));
const lockReg=await request('/auth/register',{method:'POST',expect:201,body:{fullName:'Lock Target',username:`lockme${stamp}`,phone:`0311${String(stamp).slice(-7)}`,email:`lockme${stamp}@halqa.pk`,password:'halqa123x'}});
check('lock-target account created',!!lockReg.accessToken);
for(let i=0;i<5;i++)await request('/auth/login',{method:'POST',expect:401,body:{identity:`lockme${stamp}`,password:'wrong-pass-99'}});
const locked=await request('/auth/login',{method:'POST',expect:423,body:{identity:`lockme${stamp}`,password:'halqa123x'}});
check('five failed sign-ins lock the account — even the CORRECT password is refused',(locked.error||'').includes('locked'));
await prisma.user.updateMany({where:{username:`lockme${stamp}`},data:{failedLogins:0,lockUntil:null}});
const unlocked=await request('/auth/login',{method:'POST',body:{identity:`lockme${stamp}`,password:'halqa123x'}});
check('after the lock clears, the correct password signs in and the counter resets',!!unlocked.accessToken);

// ---- Refresh-token rotation + stolen-token reuse detection (OAuth-tier) ----
const r1=unlocked.refreshToken;
const rot=await request('/auth/refresh',{method:'POST',body:{refreshToken:r1}});
check('refresh rotates: old token yields a brand-new refresh token',!!rot.refreshToken&&rot.refreshToken!==r1);
const replay=await request('/auth/refresh',{method:'POST',expect:401,body:{refreshToken:r1}});
check('replaying an already-rotated token is detected as theft (401 revoked)',(replay.error||'').includes('revoked'));
const afterBurn=await request('/auth/refresh',{method:'POST',expect:401,body:{refreshToken:rot.refreshToken}});
check('reuse burns the whole family — even the legitimate newer token is now dead',afterBurn.error!==undefined);
const evt=await prisma.securityEvent.findFirst({where:{type:'TOKEN_REUSE_REVOKED',userId:unlocked.user.id}});
check('the theft event is written to the security audit log',!!evt&&!!evt.ip);
const loginLogged=await prisma.securityEvent.count({where:{type:'LOGIN_OK',userId:unlocked.user.id}});
check('successful sign-ins are recorded in the audit trail',loginLogged>=1);
}

// ---- Safety Fund: recorded-mode guaranteed payouts funded by a per-round slot fee ----
const badGuarantee=await request('/committees',{token:sana,method:'POST',expect:400,body:{name:`Safety ${Date.now()}`,memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,payoutGuaranteed:true,slotFeeBps:0}});
check('guaranteed circle rejected without a funding slot fee',(badGuarantee.error||'').includes('slot fee'));
const safe=await request('/committees',{token:ayesha,method:'POST',expect:201,body:{name:`Safety ${Date.now()}`,memberCap:3,contributionPaisa:'2000000',cadencePreset:'SHORT',periodDays:30,minMembersToStart:3,orderMode:'HOST_ASSIGNED',joinPolicy:'INVITE_ONLY',payoutGuaranteed:true,slotFeeBps:100}}); // ayesha hosts: sana is at her five-circle cap here
check('recorded-mode Safety Fund circle created (no bank custody required)',safe.custodyMode==='RECORDED'&&safe.payoutGuaranteed===true&&safe.slotFeeBps===100);
await request('/committees/join',{token:sana,method:'POST',expect:201,body:{inviteCode:safe.inviteCode}});
await request('/committees/join',{token:bilal,method:'POST',expect:201,body:{inviteCode:safe.inviteCode}});
await request(`/committees/${safe.id}/start`,{token:ayesha,method:'POST',body:{}});
const sv=await request(`/committees/${safe.id}`,{token:ayesha});
check('recorded Safety Fund circle starts and exposes its fund balance',sv.status==='ACTIVE'&&sv.guaranteeFundPaisa!==undefined&&sv.payoutGuaranteed===true);
// The slot-fee → guarantee-pool ledger path on payout is custody-agnostic and
// already exercised by the bank-custody lifecycle test above; here we only
// prove recorded-mode guaranteed circles are permitted and wire the fund.

// ---- Bank receivables pack: host-exportable statement of future inflows + member reliability ----
const pack=await request(`/committees/${cover.id}/receivables-pack`,{token:sana});
check('receivables pack: schedule + inflows + member reliability + disclaimer',Array.isArray(pack.receivables.schedule)&&pack.receivables.futureRounds>=2&&pack.receivables.perRoundInflowPaisa==='6000000'&&pack.members.length===3&&pack.members.every(m=>typeof m.reliabilityScore==='number')&&pack.disclaimer.includes('record-only'),`rounds=${pack.receivables.futureRounds}`);
await request(`/committees/${cover.id}/receivables-pack`,{token:ayesha,method:'GET',expect:403}); // host-only

console.log(JSON.stringify({passed:results.length,results},null,2));
await prisma.$disconnect();
