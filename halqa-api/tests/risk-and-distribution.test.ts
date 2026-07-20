import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { allocateCyclePool } from '../src/lib/distribution';
import { assessRisk, stressProjection } from '../src/lib/risk-engine';
import { normalizedWeights } from '../src/routes/risk';

describe('cycle distribution',()=>{
  it('conserves every paisa across random member weights',()=>{
    fc.assert(fc.property(
      fc.bigInt({min:0n,max:10_000_000_000n}),
      fc.array(fc.record({principal:fc.bigInt({min:0n,max:1_000_000_000n}),days:fc.bigInt({min:0n,max:20_000_000_000n})}),{minLength:1,maxLength:30}),
      (pool,weights)=>{
        const held=pool===0n?0n:pool/2n;
        const rows=allocateCyclePool(pool,held,weights.map((weight,index)=>({userId:`u${index}`,paidPrincipalPaisa:weight.principal,capitalDays:weight.days})));
        expect(rows.reduce((sum,row)=>sum+row.totalPaisa,0n)).toBe(pool);
        expect(rows.every(row=>row.principalPaisa>=0n&&row.profitPaisa>=0n)).toBe(true);
      },
    ),{numRuns:2_000});
  });
});

describe('risk model invariants',()=>{
  const base={mode:'HYBRID' as const,memberCount:10,periodDays:30,contributionPaisa:1_000_000n,reinvestRatio:.25,schemeRisk:3,schemeLiquidityDays:3,schemeVolatilityBps:150,averageCreditScore:720,minimumCreditScore:680,onTimeRatio:.96,earlyPositionExposurePaisa:9_000_000n,securityDepositPaisa:4_500_000n,payoutBufferBps:1500,liquidityReserveBps:1000,concentrationBps:5000,hasGuarantor:false};
  it('stays on the public 1-10 scale',()=>{
    fc.assert(fc.property(fc.integer({min:1,max:10}),fc.integer({min:300,max:850}),(schemeRisk,score)=>{
      const result=assessRisk({...base,schemeRisk,averageCreditScore:score,minimumCreditScore:score});
      expect(result.score).toBeGreaterThanOrEqual(1);expect(result.score).toBeLessThanOrEqual(10);
    }));
  });
  it('raises risk when reliability deteriorates',()=>{
    const sound=assessRisk(base);
    const weak=assessRisk({...base,averageCreditScore:610,minimumCreditScore:550,onTimeRatio:.65,securityDepositPaisa:0n});
    expect(weak.score).toBeGreaterThan(sound.score);
    expect(weak.defaultRisk).toBeGreaterThan(sound.defaultRisk);
  });
  it('orders stress projections and uses integer paisa',()=>{
    const projection=stressProjection(12_345_678n,14.25,365,6);
    expect(BigInt(projection.downsideProfitPaisa)).toBeLessThanOrEqual(BigInt(projection.expectedProfitPaisa));
    expect(BigInt(projection.expectedProfitPaisa)).toBeLessThanOrEqual(BigInt(projection.upsideProfitPaisa));
  });
  it('normalizes portfolio allocations to exactly 100%',()=>{
    fc.assert(fc.property(fc.array(fc.double({min:.01,max:100,noNaN:true}),{minLength:1,maxLength:3}),utilities=>{
      const weights=normalizedWeights(utilities);
      expect(weights.reduce((sum,weight)=>sum+weight,0)).toBe(10_000);
      expect(weights.every(weight=>weight>=1_000)).toBe(true);
    }));
  });
});
