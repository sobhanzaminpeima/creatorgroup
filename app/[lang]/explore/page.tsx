import {notFound} from 'next/navigation';
import type {Language} from '@/app/content';
import {listUniversities} from '@/lib/university-store';
import ExploreExperience from '@/app/student-discovery';
import {pageMetadata} from '@/app/seo';
import {T} from '@/app/international-data';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{lang:string}>}){const{lang}=await params;if(!['fa','en','tr'].includes(lang))return{};return pageMetadata(lang as Language,'explore',T('جهان را کشف کن؛ مسیر تحصیلت را بساز','Explore the world. Build your student journey.','Dünyayı keşfet. Eğitim yolculuğunu oluştur.')[lang as Language],T('کشورها، دانشگاه‌ها، رشته‌ها و شهریه‌های ثبت‌شده را بشناس و انتخاب‌هایت را در مسیر شخصی نگه دار.','Discover countries, universities, programmes and recorded tuition, and save your preferences in a personal student journey.','Ülkeleri, üniversiteleri, programları ve kayıtlı ücretleri keşfet; tercihlerini kişisel yolculuğunda sakla.')[lang as Language]);}
export default async function Page({params}:{params:Promise<{lang:string}>}){const{lang}=await params;if(!['fa','en','tr'].includes(lang))notFound();return <ExploreExperience lang={lang as Language} universities={await listUniversities()}/>;}
