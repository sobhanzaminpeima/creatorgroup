import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import InternationalSite from '../international-site';
import {resolvePage} from '../international-pages';
import {ui,settings} from '../international-data';
import { type Language } from '../content';
import {pageMetadata} from '../seo';
const origin=settings.origin;
export function generateStaticParams(){return ['en','tr','fa'].map(lang=>({lang}));}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{
 const {lang}=await params;if(!['en','tr','fa'].includes(lang))return{};
 const title=`${settings.brand} — ${ui.international[lang as Language]}`;
 return pageMetadata(lang as Language,'',title,ui.intro[lang as Language]);
}
export default async function Page({params}:{params:Promise<{lang:string}>}){const{lang}=await params;if(!['en','tr','fa'].includes(lang)){if(resolvePage(lang)||lang==='services')redirect('/fa/'+lang);notFound();}return <InternationalSite lang={lang as Language}/>;}
