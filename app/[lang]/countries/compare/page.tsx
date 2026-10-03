import {notFound} from 'next/navigation';
import {listCountries} from '@/lib/country-store';
import {listUniversities} from '@/lib/university-store';
import {CountryExplorer} from '@/app/country-experience';
import type {Language} from '@/app/content';
import {pageMetadata} from '@/app/seo';
import {T} from '@/app/international-data';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{lang:string}>}){const{lang}=await params;return ['fa','en','tr'].includes(lang)?pageMetadata(lang as Language,'countries/compare',T('مقایسهٔ کشورها','Compare countries','Ülkeleri karşılaştır')[lang as Language],T('مقایسهٔ دو تا چهار کشور با اطلاعات رسمی و بدون رتبه‌بندی ساختگی.','Compare two to four countries with official information and no invented rankings.','İki ila dört ülkeyi resmî bilgilerle, yapay sıralama olmadan karşılaştır.')[lang as Language]):{};}
export default async function Page({params,searchParams}:{params:Promise<{lang:string}>;searchParams:Promise<{countries?:string}>}){const{lang}=await params;if(!['fa','en','tr'].includes(lang))notFound();const[countries,universities,q]=await Promise.all([listCountries(),listUniversities(),searchParams]);return <CountryExplorer compare initial={(q.countries||'').split(',').filter(code=>countries.some(c=>c.code===code))} lang={lang as Language} countries={countries} universities={universities}/>;}
