import {notFound} from 'next/navigation';
import {listCountries} from '@/lib/country-store';
import {listUniversities} from '@/lib/university-store';
import {CountryExplorer} from '@/app/country-experience';
import type {Language} from '@/app/content';
import {pageMetadata} from '@/app/seo';
import {T} from '@/app/international-data';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{lang:string}>}){const{lang}=await params;return ['fa','en','tr'].includes(lang)?pageMetadata(lang as Language,'countries',T('کشف مقصدهای تحصیلی','Explore your study destinations','Eğitim ülkelerini keşfet')[lang as Language],T('اطلاعات کشورها از منابع رسمی؛ تحصیل، ویزا، اقامت، کار و زندگی دانشجویی.','Country information from official sources: study, visas, residence, work and student life.','Resmî kaynaklarla ülke bilgileri: eğitim, vize, ikamet, çalışma ve öğrenci hayatı.')[lang as Language]):{};}
export default async function Page({params}:{params:Promise<{lang:string}>}){const{lang}=await params;if(!['fa','en','tr'].includes(lang))notFound();const[countries,universities]=await Promise.all([listCountries(),listUniversities()]);return <CountryExplorer lang={lang as Language} countries={countries} universities={universities}/>;}
