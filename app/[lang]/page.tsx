import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import InternationalSite from '../international-site';
import {resolvePage} from '../international-pages';
import {ui,settings} from '../international-data';
import { content, type Language } from '../content';
const origin=settings.origin;
export function generateStaticParams(){return ['en','tr','fa'].map(lang=>({lang}));}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{
 const {lang}=await params;if(!['en','tr','fa'].includes(lang))return{};const t=content[lang as Language];
 const title=`${settings.brand} — ${ui.international[lang as Language]}`;
 return {title,description:ui.intro[lang as Language],alternates:{canonical:`${origin}/${lang}`,languages:{en:`${origin}/en`,tr:`${origin}/tr`,fa:`${origin}/fa`,'x-default':`${origin}/fa`}},openGraph:{title,description:ui.intro[lang as Language],url:`${origin}/${lang}`,locale:{en:'en_US',tr:'tr_TR',fa:'fa_IR'}[lang],type:'website'},twitter:{card:'summary',title,description:ui.intro[lang as Language]}};
}
export default async function Page({params}:{params:Promise<{lang:string}>}){const{lang}=await params;if(!['en','tr','fa'].includes(lang)){if(resolvePage(lang)||lang==='services')redirect('/fa/'+lang);notFound();}return <InternationalSite lang={lang as Language}/>;}
