// Preview mode. Append ?preview=1 to the URL and the app runs against a
// realistic in-memory dataset with no API and no login. Built for demos on a
// phone and for visual checks of every screen; it never activates on its own.
export const PREVIEW=typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('preview')==='1';

const day=(n:number)=>new Date(Date.now()+n*86400000).toISOString();
const rs=(rupees:number)=>String(rupees*100);

export const previewUser={
  id:'u1',fullName:'Taha Amjed',username:'taha',phone:'03001234567',email:'taha@halqa.pk',
  cnic:'42101-1234567-1',creditScore:742,role:'MEMBER' as const,kycLevel:2,kycStatus:'VERIFIED',
  paymentStreak:14,averageRating:4.8,ratingCount:12,hasPin:true,phoneVerified:true,
  city:'Karachi',locality:'Gulshan-e-Iqbal',occupationType:'EMPLOYED',employerName:'Systems Ltd',
  jobTitle:'Site Engineer',committeesCompletedClean:3,incomeVerifiedAt:day(-40),cnicCaptured:true,
  salaryAccountLinked:true,salaryDay:1,dailyIncomeVerifiedAt:day(-12),
};

// One cast of people, each with one id and one name, so the same person is the
// same person in every committee. Committees used to build their rosters from a
// name list by index, which put the demo member in one committee under another
// member's name and gave two different people the same id.
const PEOPLE:Record<string,{fullName:string;creditScore:number}>={
  u1:{fullName:'Taha Amjed',creditScore:742},
  u11:{fullName:'Bilal Ahmed',creditScore:735},
  u12:{fullName:'Sana Khan',creditScore:712},
  u13:{fullName:'Usman Tariq',creditScore:688},
  u14:{fullName:'Hina Raza',creditScore:754},
  u15:{fullName:'Kamran Ali',creditScore:731},
  u16:{fullName:'Ayesha Noor',creditScore:768},
  u17:{fullName:'Faisal Iqbal',creditScore:702},
  u18:{fullName:'Zainab Malik',creditScore:721},
  u19:{fullName:'Imran Shah',creditScore:664},
  u20:{fullName:'Sadia Yousuf',creditScore:739},
  u21:{fullName:'Ahmed Raza',creditScore:697},
  u22:{fullName:'Mariam Siddiqui',creditScore:726},
  u23:{fullName:'Hamza Qureshi',creditScore:681},
};
const person=(id:string)=>({id,fullName:PEOPLE[id].fullName});

// A roster in turn order. Everyone before the current turn has collected.
const roster=(order:string[],collected:number)=>order.map((id,i)=>({
  id:`m-${id}`,userId:id,turnPosition:i+1,hasReceived:i<collected,status:'ACTIVE',
  autoDebitEnabled:true,autoDebitRail:'RAAST',
  user:{id,fullName:PEOPLE[id].fullName,username:id,creditScore:PEOPLE[id].creditScore,kycLevel:1},
}));

const pay=(id:string,payer:string,amount:string,status:string)=>({id,payerId:payer,amountPaisa:amount,status,
  paidVia:'RAAST',txnRef:status==='PAID'?`RCPT-${id.toUpperCase()}`:null,payer:person(payer)});

const C1=['u11','u12','u1','u13','u14','u15','u16','u17','u18','u19','u20','u21'];
const C2=['u14','u16','u22','u15','u1','u20','u23','u18','u17'];

export const previewCommittees=[
  {
    id:'c1',name:'Gulshan Neighbours',hostId:'u11',host:{...person('u11'),creditScore:735},
    status:'ACTIVE',mode:'ROTATING',memberCap:12,contributionPaisa:rs(10000),cadencePreset:'MID',periodDays:30,
    reinvestRatio:0,distributionMode:'SHARE',inviteCode:'GLSHN7',currentRound:4,minMembersToStart:8,
    riskScore:22,riskBand:'LOW',riskTolerance:2,memberConsentRequired:false,payoutBufferBps:0,
    liquidityReserveBps:0,latePenaltyBps:300,earlyFeeBps:0,tier:'CLASSIC',cleanStreak:4,
    members:roster(C1,3),
    rounds:[{
      id:'r4',roundNumber:4,recipientId:'u13',status:'COLLECTING',dueDate:day(3),payoutDate:day(5),
      grossPoolPaisa:rs(120000),reinvestPaisa:'0',payoutPaisa:rs(120000),
      recipient:person('u13'),
      payments:C1.map((id,i)=>pay(`p4${i}`,id,rs(10000),i<8?'PAID':'PENDING')),
      investments:[],
    },{
      id:'r3',roundNumber:3,recipientId:'u1',status:'CLOSED',dueDate:day(-27),payoutDate:day(-25),
      grossPoolPaisa:rs(120000),reinvestPaisa:'0',payoutPaisa:rs(120000),
      recipient:person('u1'),
      payments:C1.map((id,i)=>pay(`p3${i}`,id,rs(10000),'PAID')),
      investments:[],
    }],
  },
  {
    id:'c2',name:'Site Engineers Circle',hostId:'u1',host:{...person('u1'),creditScore:742},
    status:'ACTIVE',mode:'ROTATING',memberCap:9,contributionPaisa:rs(5000),cadencePreset:'MID',periodDays:30,
    reinvestRatio:0,distributionMode:'SHARE',inviteCode:'SITE22',currentRound:2,minMembersToStart:6,
    riskScore:18,riskBand:'LOW',riskTolerance:2,memberConsentRequired:false,payoutBufferBps:0,
    liquidityReserveBps:0,latePenaltyBps:300,earlyFeeBps:0,tier:'CLASSIC',cleanStreak:2,
    members:roster(C2,1),
    rounds:[{
      id:'r2',roundNumber:2,recipientId:'u16',status:'COLLECTING',dueDate:day(11),payoutDate:day(13),
      grossPoolPaisa:rs(45000),reinvestPaisa:'0',payoutPaisa:rs(45000),
      recipient:person('u16'),
      payments:C2.map((id,i)=>pay(`q2${i}`,id,rs(5000),i<5?'PAID':'PENDING')),
      investments:[],
    }],
  },
];

export const previewSummary={
  balancePaisa:rs(215000),totalRecordedPaisa:rs(215000),totalInvestmentProfitPaisa:'0',
  activeCommittees:2,hostedCommittees:1,
  nextInstallment:{dueAt:day(3),amountPaisa:rs(10000),committee:{id:'c1',name:'Gulshan Neighbours'}},
  nextPayout:{payoutAt:day(103),amountPaisa:rs(45000),committee:{id:'c2',name:'Site Engineers Circle'},roundNumber:5},
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

// ---- statement, limits, devices, help ---------------------------------------
// These four screens had no fixture, so preview fell through to an empty list
// and each one broke on open. The statement is built from the committees above,
// so it agrees with every committee screen, and it honours the period asked for.
const hoursAgo=(h:number)=>new Date(Date.now()-h*3600000).toISOString();

function previewStatement(path:string){
  const q=new URLSearchParams(path.split('?')[1]||'');
  const now=new Date();
  const from=q.get('from')||new Date(now.getFullYear(),now.getMonth(),1).toISOString();
  const to=q.get('to')||now.toISOString();
  const inside=(at:string)=>at>=from&&at<=to;
  const payments=previewCommittees.flatMap(c=>c.rounds.flatMap(r=>r.payments.filter(p=>p.payerId==='u1').map(p=>({
    id:p.id,
    // a paid instalment is dated the day it was paid, two days before it was due
    at:p.status==='PAID'?new Date(Math.min(Date.parse(r.dueDate)-2*86400000,Date.now()-86400000)).toISOString():r.dueDate,
    direction:'OUT' as const,kind:'INSTALMENT',status:p.status,amountPaisa:p.amountPaisa,penaltyPaisa:'0',
    rail:p.paidVia,reference:p.txnRef,committee:c.name,committeeId:c.id,turn:r.roundNumber,
  }))));
  const payouts=previewCommittees.flatMap(c=>c.rounds.filter(r=>r.recipientId==='u1').map(r=>({
    id:r.id,at:r.payoutDate,direction:'IN' as const,kind:'PAYOUT',status:r.status,amountPaisa:r.payoutPaisa,
    penaltyPaisa:'0',rail:'RAAST',reference:`PAYOUT-${r.id.toUpperCase()}`,committee:c.name,committeeId:c.id,turn:r.roundNumber,
  })));
  const lines=[...payments,...payouts].filter(l=>inside(l.at)).sort((a,b)=>b.at.localeCompare(a.at));
  const sum=(xs:{amountPaisa:string}[])=>xs.reduce((s,x)=>s+Number(x.amountPaisa),0);
  const ins=lines.filter(l=>l.direction==='OUT');
  const paid=ins.filter(l=>l.status==='PAID');
  const collected=sum(lines.filter(l=>l.direction==='IN'));
  return{
    member:{fullName:previewUser.fullName,username:previewUser.username,phone:previewUser.phone},
    from,to,
    totals:{
      paidInPaisa:String(sum(paid)),collectedPaisa:String(collected),penaltiesPaisa:'0',
      stillDuePaisa:String(sum(ins.filter(l=>l.status!=='PAID'))),netPaisa:String(collected-sum(paid)),
      instalments:paid.length,payouts:lines.filter(l=>l.direction==='IN').length,
      onTimeRate:ins.length?Math.round(paid.length/ins.length*100):null,
    },
    lines,
  };
}

// The figures the server would enforce for this member: income verified, two
// clean circles, no guarantee cheque yet.
export const previewLimits={
  level:2,levelName:'Bank verified',band:'GOOD',
  limits:[
    {key:'committees',label:'Committees at once',used:2,cap:6,note:'Your income is verified'},
    {key:'hosting',label:'Circles you host',used:1,cap:50,note:'Verified host'},
    {key:'monthly',label:'Instalments a month',usedPaisa:rs(15000),capPaisa:rs(60000),note:'A third of the income you declared'},
    {key:'turns',label:'Turns you may take',value:'Any turn',note:'Opened by two clean circles and a check from us'},
  ],
  raise:[
    {key:'cnic',done:true,label:'CNIC on file',gain:'Lets you host'},
    {key:'income',done:true,label:'Income verified',gain:'Six committees at once, and half off the service fee'},
    {key:'cheque',done:false,label:'Guarantee cheque',gain:'80 per cent off the service fee'},
    {key:'clean',done:true,label:'Two circles finished cleanly',gain:'Every turn position'},
  ],
};

export const previewDevices={
  sessions:[
    {id:'f1',signedInAt:hoursAgo(3),device:'Android phone',place:'39.37.x.x',current:true},
    {id:'f2',signedInAt:day(-6),device:'Windows computer',place:'39.37.x.x',current:false},
  ],
  recent:[
    {at:hoursAgo(3),what:'Signed in',device:'Android phone'},
    {at:day(-6),what:'Signed in',device:'Windows computer'},
    {at:day(-19),what:'Signed in',device:'Android phone'},
    {at:day(-140),what:'Account opened',device:'Android phone'},
  ],
};

export const previewTickets={
  open:0,
  tickets:[
    {id:'t2',reference:'HLQ-240917',category:'PAYMENT',subject:'Instalment still showing as due',
     body:'I paid my Gulshan Neighbours instalment on Raast last night and it still shows as due.',
     status:'ANSWERED',paymentId:'p42',committeeId:'c1',createdAt:day(-4),
     messages:[
       {id:'tm1',author:'MEMBER',body:'I paid my Gulshan Neighbours instalment on Raast last night and it still shows as due.',createdAt:day(-4)},
       {id:'tm2',author:'HALQA',body:'Your bank confirmed the payment at 9:04 pm and turn 4 now shows it as paid, reference RCPT-P42. Nothing more is owed for this turn.',createdAt:day(-4)},
     ]},
    {id:'t1',reference:'HLQ-238106',category:'ACCOUNT',subject:'Changing the account my payout goes to',
     body:'I want my next payout to go to my Meezan account instead of Raast.',
     status:'RESOLVED',paymentId:null,committeeId:'c2',createdAt:day(-38),
     messages:[
       {id:'tm3',author:'MEMBER',body:'I want my next payout to go to my Meezan account instead of Raast.',createdAt:day(-38)},
       {id:'tm4',author:'HALQA',body:'Done. Payouts now go to Meezan Bank, account ending 8841. You can change this yourself under Account, Payment methods.',createdAt:day(-37)},
     ]},
  ],
};

// Route table for the mock transport in api.ts.
export function previewRoute(path:string,init:RequestInit={}):unknown{
  const post=(init.method||'GET').toUpperCase()==='POST';
  const body=(()=>{try{return JSON.parse(String(init.body||'{}'))}catch{return{}}})();
  if(path.startsWith('/auth/me'))return previewUser;
  // a new case in preview gets a reference and appears as open, as it would live
  if(post&&path==='/support/tickets')return{id:'t-new',reference:'HLQ-'+String(Date.now()).slice(-6),
    category:body.category||'QUESTION',subject:body.subject||'',body:body.body||'',status:'OPEN',
    paymentId:body.paymentId||null,committeeId:body.committeeId||null,createdAt:new Date().toISOString(),
    messages:[{id:'tm-new',author:'MEMBER',body:body.body||'',createdAt:new Date().toISOString()}]};
  if(path.startsWith('/account/statement'))return previewStatement(path);
  if(path.startsWith('/account/limits'))return previewLimits;
  if(path.startsWith('/account/devices/sign-out-others'))return{signedOut:1};
  if(path.startsWith('/account/devices'))return previewDevices;
  if(/^\/support\/tickets\/[^/]+\/reply/.test(path))return{...previewTickets.tickets[0],status:'OPEN'};
  if(/^\/support\/tickets\/[^/]+$/.test(path))return previewTickets.tickets.find(x=>path.endsWith(x.id))??previewTickets.tickets[0];
  if(path.startsWith('/support/tickets'))return previewTickets;
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
  if(path.startsWith('/payments/mine'))return previewCommittees.flatMap(c=>c.rounds.flatMap(r=>r.payments.filter(x=>x.payerId==='u1').map(x=>({...x,dueDate:r.dueDate,roundNumber:r.roundNumber,committee:{id:c.id,name:c.name},round:{roundNumber:r.roundNumber,dueDate:r.dueDate,payoutDate:r.payoutDate,committee:{id:c.id,name:c.name}}}))));
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
