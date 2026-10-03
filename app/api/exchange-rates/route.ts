import {getIranRate} from '@/lib/iran-exchange-rate';
export const dynamic='force-dynamic';
const currencies=['USD','EUR','GBP','TRY','AED','CNY','RUB','CHF','CAD','AUD','JPY','SAR'];
async function referenceRates(){
 const response=await fetch('https://open.er-api.com/v6/latest/USD',{next:{revalidate:3600},signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error('Provider unavailable');
 const data=await response.json() as {result?:string;base_code?:string;time_last_update_unix:number;time_next_update_unix?:number;rates?:Record<string,unknown>};
 if(data.result!=='success'||data.base_code!=='USD'||!Number.isFinite(data.time_last_update_unix)||data.time_last_update_unix>Date.now()/1000+300||Date.now()/1000-data.time_last_update_unix>172800)throw Error('Invalid or outdated data');
 const rates:Record<string,number>={};
 for(const c of currencies){const n=data.rates?.[c];if(typeof n!=='number'||!Number.isFinite(n)||n<=0)throw Error('Missing rate');rates[c]=n;}
 return {rates,updatedAt:data.time_last_update_unix*1000,nextUpdateAt:typeof data.time_next_update_unix==='number'?data.time_next_update_unix*1000:null};
}
export async function GET(){
 const [reference,iran]=await Promise.all([referenceRates().catch(()=>null),getIranRate().catch(()=>null)]);
 if(!reference&&!iran)return Response.json({error:'Rates temporarily unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});
 const rates=reference?.rates||{USD:1};
 if(iran)rates.IRR=iran.rate;
 return Response.json({base:'USD',rates,iran,updatedAt:reference?.updatedAt??null,nextUpdateAt:reference?.nextUpdateAt??null,source:'ExchangeRate-API / TGJU',frequency:'daily / 60-second checks'},{headers:{'Cache-Control':'no-store'}});
}
