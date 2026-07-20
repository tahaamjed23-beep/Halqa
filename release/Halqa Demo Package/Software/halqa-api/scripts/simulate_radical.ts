import { assessRisk, bandFor } from '../src/lib/risk-engine';

type Mode='ROTATING'|'HYBRID'|'INVESTMENT';
type Outcome={mode:Mode;risk:number;netPaisa:bigint;principalPaisa:bigint;uncoveredDefaultPaisa:bigint};

const RUNS=25_000;
let seed=0x48414c51;
const random=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const integer=(min:number,max:number)=>Math.floor(random()*(max-min+1))+min;
const normal=()=>Math.sqrt(-2*Math.log(Math.max(random(),1e-12)))*Math.cos(2*Math.PI*random());
const percentile=(rows:bigint[],p:number)=>rows[Math.min(rows.length-1,Math.floor((rows.length-1)*p))];
const pkr=(value:bigint)=>Number(value)/100;

function scenario():Outcome{
  const modes:Mode[]=['ROTATING','HYBRID','INVESTMENT'];
  const mode=modes[integer(0,modes.length-1)];
  const members=integer(3,30);
  const periodDays=[7,14,30,60,90][integer(0,4)];
  const contributionPaisa=BigInt(integer(5_000,250_000))*100n;
  const risk=integer(1,mode==='ROTATING'?3:mode==='HYBRID'?6:8);
  const maxAllocation=mode==='ROTATING'?25:mode==='HYBRID'?75:100;
  const minAllocation=mode==='INVESTMENT'?50:0;
  const allocationBps=BigInt(integer(minAllocation,maxAllocation)*100);
  const annualRateBps=BigInt(Math.round((8+risk*1.25+random()*2)*100));
  const volatilityBps=Math.round(80+risk*risk*42);
  const grossPerRound=contributionPaisa*BigInt(members);
  const investedPerRound=grossPerRound*allocationBps/10_000n;
  const investedPrincipal=investedPerRound*BigInt(members);
  const averageHoldingDays=Math.max(1,Math.round(periodDays*(members-1)/2));
  const shockedAnnualBps=Math.max(-9_500,Math.round(Number(annualRateBps)+normal()*volatilityBps));
  const grossPnl=investedPrincipal*BigInt(shockedAnnualBps)*BigInt(averageHoldingDays)/(10_000n*365n);
  const platformFee=grossPnl>0n?grossPnl*5n/100n:0n;

  const averageCredit=integer(650,790);
  const minimumCredit=Math.max(550,averageCredit-integer(20,120));
  const onTimeRatio=.82+random()*.18;
  const defaultProbability=Math.max(.002,Math.min(.24,(720-averageCredit)/800+(1-onTimeRatio)*.45+periodDays/6000));
  let uncoveredDefault=0n;
  if(random()<defaultProbability){
    const remainingDues=contributionPaisa*BigInt(integer(1,Math.max(1,members-1)));
    const depositCoverageBps=BigInt(integer(3_000,7_000));
    uncoveredDefault=remainingDues-remainingDues*depositCoverageBps/10_000n;
  }

  assessRisk({mode,memberCount:members,periodDays,contributionPaisa,reinvestRatio:Number(allocationBps)/10_000,schemeRisk:risk,schemeLiquidityDays:integer(1,Math.max(1,periodDays)),schemeVolatilityBps:volatilityBps,averageCreditScore:averageCredit,minimumCreditScore:minimumCredit,onTimeRatio,earlyPositionExposurePaisa:contributionPaisa*BigInt(members-1),securityDepositPaisa:contributionPaisa*BigInt(members-1)*5n/10n,payoutBufferBps:1500,liquidityReserveBps:1000,concentrationBps:integer(3_500,10_000),hasGuarantor:false});
  return{mode,risk,netPaisa:grossPnl-platformFee-uncoveredDefault,principalPaisa:investedPrincipal,uncoveredDefaultPaisa:uncoveredDefault};
}

const outcomes=Array.from({length:RUNS},scenario);
const summarize=(rows:Outcome[])=>{
  const nets=rows.map(row=>row.netPaisa).sort((a,b)=>a<b?-1:a>b?1:0);
  const principal=rows.reduce((sum,row)=>sum+row.principalPaisa,0n);
  const uncovered=rows.reduce((sum,row)=>sum+row.uncoveredDefaultPaisa,0n);
  return{runs:rows.length,lossFrequencyPct:Number((BigInt(rows.filter(row=>row.netPaisa<0n).length)*10_000n/BigInt(rows.length)))/100,defaultShortfallFrequencyPct:Number((BigInt(rows.filter(row=>row.uncoveredDefaultPaisa>0n).length)*10_000n/BigInt(rows.length)))/100,medianNetPkr:pkr(percentile(nets,.5)),p05NetPkr:pkr(percentile(nets,.05)),p95NetPkr:pkr(percentile(nets,.95)),aggregateUncoveredDefaultPkr:pkr(uncovered),aggregatePrincipalPkr:pkr(principal)};
};

const report={
  model:'HALQA-STOCHASTIC-SCENARIO-1.0',seed:'0x48414c51',runs:RUNS,
  disclaimer:'Synthetic stress testing for software controls. Not a forecast, recommendation, or claim of real-world returns.',
  overall:summarize(outcomes),
  byMode:Object.fromEntries((['ROTATING','HYBRID','INVESTMENT'] as Mode[]).map(mode=>[mode,summarize(outcomes.filter(row=>row.mode===mode))])),
  byRiskBand:Object.fromEntries(['LOW','MEDIUM','HIGH'].map(riskBand=>[riskBand,summarize(outcomes.filter(row=>bandFor(row.risk)===riskBand))])),
};
console.log(JSON.stringify(report,null,2));
