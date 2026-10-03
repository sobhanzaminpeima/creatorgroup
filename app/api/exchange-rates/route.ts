export const revalidate=3600;
const currencies=['USD','EUR','GBP','TRY','AED','CNY','RUB','CHF','CAD','AUD','JPY','SAR','IRR'];
export async function GET(){
 try{
  const response=await fetch('https://open.er-api.com/v6/latest/USD',{next:{revalidate:3600},signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error('Provider unavailable');
  const data=await response.json() as {result?:string;base_code?:string;time_last_update_unix:number;time_next_update_unix?:number;rates?:Record<string,unknown>};
  if(data.result!=='success'||data.base_code!=='USD'||!Number.isFinite(data.time_last_update_unix)||data.time_last_update_unix> Date.now()/1000+300||Date.now()/1000-data.time_last_update_unix>172800)throw Error('Invalid or outdated data');
  const rates:Record<string,number>={};
  for(const c of currencies){const n=data.rates?.[c];if(typeof n!=='number'||!Number.isFinite(n)||n<=0)throw Error('Missing rate');rates[c]=n;}
  return Response.json({base:'USD',rates,updatedAt:data.time_last_update_unix*1000,nextUpdateAt:typeof data.time_next_update_unix==='number'?data.time_next_update_unix*1000:null,source:'ExchangeRate-API',frequency:'daily'},{headers:{'Cache-Control':'public, max-age=300'}});
 }catch{return Response.json({error:'Rates temporarily unavailable'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
