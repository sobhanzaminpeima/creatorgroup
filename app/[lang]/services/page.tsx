import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CreatorSite from '../../site';
import { content, type Language } from '../../content';
const origin=(process.env.NEXT_PUBLIC_SITE_URL||'https://creator-group.mehradmoharramzadeh1.chatgpt.site').replace(/\/$/,'');
export function generateStaticParams(){return ['en','tr','fa'].map(lang=>({lang}));}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{
 const {lang}=await params;if(!['en','tr','fa'].includes(lang))return{};const t=content[lang as Language];
 const title=`Creator Group — ${t.eyebrow}`;
 return {title,description:t.intro,alternates:{canonical:`${origin}/${lang}/services`,languages:{en:`${origin}/en`,tr:`${origin}/tr`,fa:`${origin}/fa`,'x-default':`${origin}/en`}},openGraph:{title,description:t.intro,url:`${origin}/${lang}/services`,locale:{en:'en_US',tr:'tr_TR',fa:'fa_IR'}[lang],type:'website'},twitter:{card:'summary',title,description:t.intro}};
}
export default async function Page({params}:{params:Promise<{lang:string}>}){const{lang}=await params;if(!['en','tr','fa'].includes(lang))notFound();return <CreatorSite lang={lang as Language}/>;}
