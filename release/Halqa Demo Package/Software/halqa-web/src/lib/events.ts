export type HalqaAction = 'CREATE_CIRCLE'|'PAY_INSTALLMENT'|'VAULT_DEPOSIT'|'VAULT_SWEEP'|'PAYOUT'|'CONSENT'|'JOIN';

export const emitHalqaAction = (type: HalqaAction) =>
  window.dispatchEvent(new CustomEvent('halqa:action', { detail: { type } }));
