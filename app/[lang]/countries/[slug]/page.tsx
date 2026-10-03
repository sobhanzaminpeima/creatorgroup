import {notFound} from 'next/navigation';
import {getCountry} from '@/lib/country-store';
import {listUniversities} from '@/lib/university-store';
import CountryExperience from '@/app/country-experience';
import type {Language} from '@/app/content';
import {pageMetadata} from '@/app/seo';
import {settings,T} from '@/app/international-data';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{lang:string;slug:string}>}){const{lang,slug}=await params;if(!['fa','en','tr'].includes(lang))return{};const c=await getCountry(slug);if(!c)return{};const title=T('تحصیل و زندگی در','Study and live in','Eğitim ve yaşam:')[lang as Language]+' '+c.name[lang as Language],m=pageMetadata(lang as Language,`countries/${c.slug}`,title,c.overview[lang as Language]);return {...m,openGraph:{...m.openGraph,images:[{url:c.heroImage.startsWith('https://')?c.heroImage:settings.origin+c.heroImage,alt:c.heroCredit[lang as Language]}]}};}
export default async function Page({params}:{params:Promise<{lang:string;slug:string}>}){const{lang,slug}=await params;if(!['fa','en','tr'].includes(lang))notFound();const c=await getCountry(slug);if(!c)notFound();return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:c.name[lang as Language],description:c.overview[lang as Language],url:`${settings.origin}/${lang}/countries/${c.slug}`,dateModified:c.updated_at,inLanguage:lang,about:{'@type':'Country',name:c.name.en}}).replace(/</g,'\\u003c')}}/><CountryExperience country={c} universities={await listUniversities()} lang={lang as Language}/></>;}
