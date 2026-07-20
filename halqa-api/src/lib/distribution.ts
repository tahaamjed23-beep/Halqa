export type CapitalAccount={userId:string;paidPrincipalPaisa:bigint;capitalDays:bigint};
export type CapitalDistribution={userId:string;principalPaisa:bigint;profitPaisa:bigint;totalPaisa:bigint};

export function allocateCyclePool(poolPaisa:bigint,principalHeldPaisa:bigint,accounts:CapitalAccount[]):CapitalDistribution[]{
  if(poolPaisa<0n||principalHeldPaisa<0n)throw new Error('Distribution values cannot be negative');
  if(!accounts.length)return[];
  if(new Set(accounts.map(account=>account.userId)).size!==accounts.length)throw new Error('Distribution accounts must be unique');
  const principalHeld=principalHeldPaisa<poolPaisa?principalHeldPaisa:poolPaisa;
  const profitPool=poolPaisa-principalHeld;
  const principalWeight=accounts.reduce((sum,account)=>sum+account.paidPrincipalPaisa,0n);
  const capitalDaysWeight=accounts.reduce((sum,account)=>sum+account.capitalDays,0n);
  let principalRemainder=principalHeld;
  let profitRemainder=profitPool;
  return accounts.map((account,index)=>{
    const last=index===accounts.length-1;
    const principal=last?principalRemainder:principalWeight>0n?principalHeld*account.paidPrincipalPaisa/principalWeight:principalHeld/BigInt(accounts.length);
    const profit=last?profitRemainder:capitalDaysWeight>0n?profitPool*account.capitalDays/capitalDaysWeight:profitPool/BigInt(accounts.length);
    principalRemainder-=principal;profitRemainder-=profit;
    return{userId:account.userId,principalPaisa:principal,profitPaisa:profit,totalPaisa:principal+profit};
  });
}
