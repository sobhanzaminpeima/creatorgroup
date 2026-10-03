import {redirect} from 'next/navigation';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const q=await searchParams;redirect('/fa/countries/compare'+(typeof q.countries==='string'?'?countries='+encodeURIComponent(q.countries):''));}
