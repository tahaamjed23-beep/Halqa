// Preview mode. Append ?preview=1 to the URL and the app runs against a
// realistic in-memory dataset with no API and no login. Built for demos on a
// phone and for visual checks of every screen; it never activates on its own.
export const PREVIEW=typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('preview')==='1';

const day=(n:number)=>new Date(Date.now()+n*86400000).toISOString();
const rs=(rupees:number)=>String(rupees*100);

export const previewUser={
  id:'u1',fullName:'Taha Amjed',username:'taha',phone:'03001234567',email:'taha@halqa.pk',
  cnic:'42101-1234567-1',creditScore:742,role:'MEMBER' as const,kycLevel:1,kycStatus:'VERIFIED',
  paymentStreak:14,averageRating:4.8,ratingCount:12,hasPin:true,phoneVerified:true,
  city:'Karachi',locality:'Gulshan-e-Iqbal',occupationType:'SALARIED',employerName:'Systems Ltd',
  jobTitle:'Site Engineer',committeesCompletedClean:3,incomeVerifiedAt:day(-40),cnicCaptured:true,
};

const members=(n:number,names:string[])=>Array.from({length:n},(_,i)=>({
  id:`m${i}`,userId:i===0?'u1':`u${i+10}`,turnPosition:i+1,hasReceived:i<2,status:'ACTIVE',
  autoDebitEnabled:true,autoDebitRail:'RAAST',
  user:{id:i===0?'u1':`u${i+10}`,fullName:names[i%names.length],username:`m${i}`,creditScore:640+i*7,kycLevel:1},
}));
const NAMES=['Taha Amjed','Bilal Ahmed','Sana Khan','Usman Tariq','Hina Raza','Kamran Ali','Ayesha Noor','Faisal Iqbal','Zainab Malik','Imran Shah','Sadia Yousuf','Ahmed Raza'];

const pay=(id:string,payer:string,amount:string,status:string)=>({id,payerId:payer,amountPaisa:amount,status,paidVia:'RAAST',txnRef:`RCPT-${id.toUpperCase()}`,payer:{id:payer,fullName:NAMES[Number(id.slice(-1))%NAMES.length]}});

export const previewCommittees=[
  {
    id:'c1',name:'Gulshan Neighbours',hostId:'u11',host:{id:'u11',fullName:'Bilal Ahmed',creditScore:735},
    status:'ACTIVE',mode:'ROTATING',memberCap:12,contributionPaisa:rs(10000),cadencePreset:'MID',periodDays:30,
    reinvestRatio:0,distributionMode:'SHARE',inviteCode:'GLSHN7',currentRound:4,minMembersToStart:8,
    riskScore:22,riskBand:'LOW',riskTolerance:2,memberConsentRequired:false,payoutBufferBps:0,
    liquidityReserveBps:0,latePenaltyBps:300,earlyFeeBps:100,tier:'CLASSIC',cleanStreak:4,
    members:members(12,NAMES),
    rounds:[{
      id:'r4',roundNumber:4,recipientId:'u13',status:'COLLECTING',dueDate:day(3),payoutDate:day(5),
      grossPoolPaisa:rs(120000),reinvestPaisa:'0',payoutPaisa:rs(120000),
      recipient:{id:'u13',fullName:'Sana Khan'},
      payments:Array.from({length:12},(_,i)=>pay(`p4${i}`,i===0?'u1':`u${i+10}`,rs(10000),i<8?'PAID':'PENDING')),
      investments:[],
    },{
      id:'r3',roundNumber:3,recipientId:'u1',status:'CLOSED',dueDate:day(-27),payoutDate:day(-25),
      grossPoolPaisa:rs(120000),reinvestPaisa:'0',payoutPaisa:rs(120000),
      recipient:{id:'u1',fullName:'Taha Amjed'},
      payments:Array.from({length:12},(_,i)=>pay(`p3${i}`,i===0?'u1':`u${i+10}`,rs(10000),'PAID')),
      investments:[],
    }],
  },
  {
    id:'c2',name:'Site Engineers Circle',hostId:'u1',host:{id:'u1',fullName:'Taha Amjed',creditScore:742},
    status:'ACTIVE',mode:'ROTATING',memberCap:10,contributionPaisa:rs(5000),cadencePreset:'MID',periodDays:30,
    reinvestRatio:0,distributionMode:'SHARE',inviteCode:'SITE22',currentRound:2,minMembersToStart:6,
    riskScore:18,riskBand:'LOW',riskTolerance:2,memberConsentRequired:false,payoutBufferBps:0,
    liquidityReserveBps:0,latePenaltyBps:300,earlyFeeBps:0,tier:'CLASSIC',cleanStreak:2,
    members:members(9,NAMES.slice(2)),
    rounds:[{
      id:'r2',roundNumber:2,recipientId:'u14',status:'COLLECTING',dueDate:day(11),payoutDate:day(13),
      grossPoolPaisa:rs(50000),reinvestPaisa:'0',payoutPaisa:rs(50000),
      recipient:{id:'u14',fullName:'Usman Tariq'},
      payments:Array.from({length:9},(_,i)=>pay(`q2${i}`,i===0?'u1':`u${i+10}`,rs(5000),i<5?'PAID':'PENDING')),
      investments:[],
    }],
  },
];

export const previewSummary={
  balancePaisa:rs(215000),totalRecordedPaisa:rs(215000),totalInvestmentProfitPaisa:'0',
  activeCommittees:2,hostedCommittees:1,
  nextInstallment:{dueAt:day(3),amountPaisa:rs(10000),committee:{id:'c1',name:'Gulshan Neighbours'}},
  nextPayout:{payoutAt:day(43),amountPaisa:rs(50000),committee:{id:'c2',name:'Site Engineers Circle'},roundNumber:5},
};

export const previewNotices=[
  {id:'n1',type:'PAYMENT_RECEIPT',message:'Rs 10,000 paid to Gulshan Neighbours round 3. Reference RCPT-8F2A1C09.',isRead:false,createdAt:day(-25)},
  {id:'n2',type:'PAYOUT_RELEASED',message:'Rs 120,000 released to your account for round 3.',isRead:false,createdAt:day(-25)},
  {id:'n3',type:'REMINDER',message:'Your installment of Rs 10,000 collects on the 1st, your declared payday.',isRead:true,createdAt:day(-2)},
];

export const previewDiscover=[
  {id:'d1',name:'Clifton Traders Circle',hostName:'Kamran Ali',hostScore:731,memberCap:12,members:9,
   contributionPaisa:rs(15000),periodDays:30,status:'FORMING',listedPublicly:true,earlyFeeBps:100,
   openSlots:[9,10,11,12],cleanStreak:6,startsAt:day(9),tier:'CLASSIC',riskBand:'LOW'},
  {id:'d2',name:'Saddar Shopkeepers',hostName:'Faisal Iqbal',hostScore:702,memberCap:10,members:10,
   contributionPaisa:rs(8000),periodDays:30,status:'ACTIVE',listedPublicly:true,earlyFeeBps:0,
   openSlots:[],cleanStreak:11,startsAt:day(24),tier:'CLASSIC',riskBand:'LOW'},
  {id:'d3',name:'Teachers Monthly',hostName:'Ayesha Noor',hostScore:768,memberCap:12,members:7,
   contributionPaisa:rs(5000),periodDays:30,status:'FORMING',listedPublicly:true,earlyFeeBps:100,
   openSlots:[8,9,10,11,12],cleanStreak:3,startsAt:day(5),tier:'CLASSIC',riskBand:'LOW'},
];

export const previewMethods=[
  {id:'pm1',rail:'RAAST',accountNo:'03001234567',accountTitle:'Taha Amjed',label:'Raast ID',kind:'RAAST',masked:'0300 ••• 4567',preferred:true,verified:true},
  {id:'pm2',rail:'BANK_TRANSFER',accountNo:'PK36MEZN0000123456788841',accountTitle:'Taha Amjed',bankName:'Meezan Bank',label:'Meezan Bank',kind:'BANK',masked:'PK•• MEZN •••• 8841',preferred:false,verified:true},
  {id:'pm3',rail:'CARD',accountNo:'4111111111114419',accountTitle:'Taha Amjed',label:'Visa debit',kind:'CARD',masked:'•••• •••• •••• 4419',brand:'VISA',last4:'4419',expiry:'09/29',preferred:false,verified:true},
];

// Route table for the mock transport in api.ts.
export function previewRoute(path:string):unknown{
  if(path.startsWith('/auth/me'))return previewUser;
  if(path.startsWith('/committees/discover'))return previewDiscover;
  if(/^\/committees\/[^/?]+$/.test(path.split('?')[0])){
    const id=path.split('?')[0].split('/')[2];
    return previewCommittees.find(c=>c.id===id)??previewCommittees[0];
  }
  if(path.startsWith('/committees'))return previewCommittees;
  if(path.startsWith('/profile/summary'))return previewSummary;
  if(path.startsWith('/profile/payment-methods'))return{methods:previewMethods};
  if(path.startsWith('/profile/salary-status'))return{linked:true,verified:true,salaryDay:1,months:2};
  if(path.startsWith('/profile/credit'))return[
    {id:'ce1',delta:10,reason:'Installment paid on time',createdAt:day(-2)},
    {id:'ce2',delta:10,reason:'Installment paid on time',createdAt:day(-32)},
    {id:'ce3',delta:40,reason:'Circle completed clean',createdAt:day(-60)}];
  if(path.startsWith('/payments/mine'))return previewCommittees.flatMap(c=>c.rounds.flatMap(r=>r.payments.filter(x=>x.payerId==='u1').map(x=>({...x,dueDate:r.dueDate,roundNumber:r.roundNumber,committee:{id:c.id,name:c.name},round:{roundNumber:r.roundNumber,committee:{id:c.id,name:c.name}}}))));
  if(path.startsWith('/protection/committee/'))return{
    policy:{payoutHoldbackEnabled:true,progressivePenalties:true,featureLockOnDefault:true,
      smartNudges:true,rehabilitationCooldownMonths:6},
    payoutBufferBps:1500,latePenaltyBps:200,forwardLiabilityGateEnabled:false,
    matrix:previewCommittees[0].members.map((m,i)=>({
      user:{id:m.userId,fullName:m.user.fullName},
      turnPosition:m.turnPosition,
      remainingDuesPaisa:rs(60000),heldDepositPaisa:'0',heldPayoutPaisa:'0',
      defaultImpactPaisa:rs(60000),daysToDeadline:i===0?6:12,
      currentPayment:{status:i%4===3?'PENDING':'PAID'},
    })),
  };
  if(path.startsWith('/protection/recovery/mine'))return[];
  // The vault fixture has to be the real response shape. It used to be a stub
  // with none of the fields the screen reads, so preview mode showed the error
  // boundary instead of the vault, and nobody could eyeball the screen.
  if(path.startsWith('/vault'))return{
    enabled:true,tier:'STANDARD',tiers:['STANDARD','INCOME'],autoCover:true,
    balancePaisa:rs(48500),accruedProfitPaisa:rs(1310),ratePct:10.8,
    allocation:{STANDARD:70,INCOME:30},
    tierDetails:[
      {tier:'STANDARD',sharePct:70,name:'Islamic money market basket',ratePct:10.8,rateAsOf:day(-9),shariahCompliant:true,riskScore:2,volatilityBps:90,liquidityDays:1,issuer:'Al Meezan',sourceUrl:'https://www.almeezangroup.com'},
      {tier:'INCOME',sharePct:30,name:'Islamic income fund basket',ratePct:12.1,rateAsOf:day(-9),shariahCompliant:true,riskScore:4,volatilityBps:220,liquidityDays:2,issuer:'Al Meezan',sourceUrl:'https://www.almeezangroup.com'},
    ],
    blendedRatePct:11.19,blendedRiskScore:2.6,mudaribFeePct:5,custodyStage:'RECORD_ONLY',
    goal:{targetPaisa:rs(120000),name:'Eid and school fees'},
    history:[
      {id:'v5',at:day(-2),direction:'IN',amountPaisa:rs(10000),reason:'VAULT_TOPUP_RECORDED',earnedPaisa:rs(6),daysHeld:2},
      {id:'v4',at:day(-16),direction:'IN',amountPaisa:rs(30000),reason:'VAULT_PARKING_RECORDED',earnedPaisa:rs(142),daysHeld:16},
      {id:'v3',at:day(-31),direction:'OUT',amountPaisa:rs(12000),reason:'VAULT_SWEEP_PRINCIPAL_RECORDED',earnedPaisa:'0',daysHeld:0},
      {id:'v2',at:day(-31),direction:'IN',amountPaisa:rs(8500),reason:'VAULT_REMAINDER_REPARKED',earnedPaisa:rs(88),daysHeld:31},
      {id:'v1',at:day(-58),direction:'IN',amountPaisa:rs(20000),reason:'VAULT_TOPUP_RECORDED',earnedPaisa:rs(374),daysHeld:58},
    ],
  };
  if(path.startsWith('/partner'))return{partner:null};
  if(path.startsWith('/notifications'))return previewNotices;
  if(path.includes('/pay'))return{txnRef:`RCPT-${Math.random().toString(36).slice(2,10).toUpperCase()}`};
  if(path.startsWith('/agreements'))return{signedAt:day(-1),required:false};
  if(path.startsWith('/credit')||path.startsWith('/risk'))return{score:previewUser.creditScore,events:[]};
  return [];
}
