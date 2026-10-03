import {redirect} from 'next/navigation';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const q=await searchParams;const query=new URLSearchParams();for(const [k,v] of Object.entries(q))if(typeof v==='string')query.set(k,v);redirect('/fa/flights'+(query.size?'?'+query.toString():''));}
