import type {Metadata} from 'next';
import {notFound,redirect} from 'next/navigation';
import InternationalSite from '../../international-site';
import {resolvePage,intlPaths} from '../../international-pages';
import {settings} from '../../international-data';
import type {Language} from '../../content';
import {getUniversity} from '@/lib/university-store';
import {pageMetadata} from '../../seo';
export function generateStaticParams(){return ['fa','en','tr'].flatMap(lang=>intlPaths.map(path=>({lang,path:path.split('/')})));}
export async function generateMetadata({params}:{params:Promise<{lang:string;path:string[]}>}):Promise<Metadata>{const{lang,path}=await params;const page=resolvePage(path.join('/'));if(!page||!['fa','en','tr'].includes(lang))return{};return pageMetadata(lang as Language,path.join('/'),`${page.title[lang as Language]} — ${settings.brand}`,page.description[lang as Language]);}

export default async function Page({params}:{params:Promise<{lang:string;path:string[]}>}){const{lang,path}=await params;if(!['fa','en','tr'].includes(lang)){if(resolvePage([lang,...path].join('/')))redirect(`/fa/${[lang,...path].join('/')}`);notFound()}const slug=path.join('/');if(slug.startsWith('university-prices/')){const u=await getUniversity(path[1]);if(u)redirect(`/${lang}/universities/${u.slug}`);}if(!resolvePage(slug))notFound();return <InternationalSite lang={lang as Language} path={slug}/>}
