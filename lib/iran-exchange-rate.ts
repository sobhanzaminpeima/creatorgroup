const sourceUrl='https://www.tgju.org/profile/price_dollar_rl';
export type IranRate={rate:number;updatedAt:number;checkedAt:number;source:string;sourceUrl:string};
let cached:IranRate|undefined;
let pending:Promise<IranRate>|undefined;
export function parseIranRate(data:unknown,now=Date.now()):IranRate{
 const row=(data as {current?:{price_dollar_rl?:{p?:unknown;ts?:unknown}}})?.current?.price_dollar_rl;
 if(typeof row?.p!=='string'||typeof row.ts!=='string'||!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(row.ts))throw Error('Invalid Iran quote');
 const rate=Number(row.p.replace(/,/g,''));
 const updatedAt=Date.parse(row.ts.replace(' ','T')+'+03:30');
 // The feed quotes USD banknotes in Iranian rial, not toman or USDT.
 if(!Number.isFinite(rate)||rate<=0||!Number.isFinite(updatedAt)||updatedAt>now+300000||now-updatedAt>72*3600000)throw Error('Unavailable or outdated Iran quote');
 return {rate,updatedAt,checkedAt:now,source:'TGJU',sourceUrl};
}
export async function getIranRate():Promise<IranRate>{
 if(cached&&Date.now()-cached.checkedAt<60000&&Date.now()-cached.updatedAt<=72*3600000)return cached;
 if(pending)return pending;
 pending=(async()=>{const response=await fetch(`https://call.tgju.org/ajax.json?rev=${Math.floor(Date.now()/60000)}`,{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Iran rate source unavailable');const quote=parseIranRate(await response.json());cached=quote;return quote;})();
 try{return await pending;}finally{pending=undefined;}
}
