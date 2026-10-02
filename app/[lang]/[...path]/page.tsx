import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import InternationalSite from '../../international-site';
import {resolvePage,intlPaths} from '../../international-pages';
import {settings} from '../../international-data';
import type {Language} from '../../content';
export function generateStaticParams(){return ['fa','en','tr'].flatMap(lang=>intlPaths.map(path=>({lang,path:path.split('/')})));}
export async function generateMetadata({params}:{params:Promise<{lang:string;path:string[]}>}):Promise<Metadata>{const{lang,path}=await params;const page=resolvePage(path.join('/'));if(!page||!['fa','en','tr'].includes(lang))return{};const l=lang as Language;const url=`${settings.origin}/${lang}/${path.join('/')}`;return{title:`${page.title[l]} — ${settings.brand}`,description:page.description[l],alternates:{canonical:url,languages:Object.fromEntries(['fa','en','tr'].map(x=>[x,`${settings.origin}/${x}/${path.join('/')}`]))},robots:path[0]==='track-request'?{index:false,follow:true}:undefined,openGraph:{title:page.title[l],description:page.description[l],url,type:page.type==='article'?'article':'website'}};}
export default async function Page({params}:{params:Promise<{lang:string;path:string[]}>}){const{lang,path}=await params;if(!['fa','en','tr'].includes(lang)){if(resolvePage([lang,...path].join('/')))redirect(`/fa/${[lang,...path].join('/')}`);notFound()}const slug=path.join('/');if(!resolvePage(slug))notFound();return <InternationalSite lang={lang as Language} path={slug}/>}
