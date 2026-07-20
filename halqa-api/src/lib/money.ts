export const paisa = (rupees: number): bigint => BigInt(Math.round(rupees * 100));
export const rupees = (value: bigint): number => Number(value) / 100;
export const clampScore = (score: number): number => Math.max(300, Math.min(850, score));

export function projectedReturn(principalPaisa: bigint, annualRatePct: number, days: number): bigint {
  const scaledRate = BigInt(Math.round(annualRatePct * 10_000));
  return (principalPaisa * scaledRate * BigInt(days)) / (1_000_000n * 365n);
}

export function projectionBand(principalPaisa: bigint, annualRatePct: number, days: number) {
  const profit = (rate: number) => projectedReturn(principalPaisa, rate, days);
  return {
    pessimisticProfitPaisa: profit(annualRatePct * 0.7),
    expectedProfitPaisa: profit(annualRatePct),
    optimisticProfitPaisa: profit(annualRatePct * 1.3),
  };
}

export const jsonSafe = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value, (_key, current) => typeof current === 'bigint' ? current.toString() : current));
import { z } from 'zod';

export const paisaInput = z.union([
  z.string().regex(/^\d{1,15}$/, 'Use a whole-number paisa value with at most 15 digits').transform(value => BigInt(value)),
  z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).transform(value => BigInt(value)),
]);
