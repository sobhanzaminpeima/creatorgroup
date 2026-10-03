import {notFound} from 'next/navigation';
import {listUniversities} from '@/lib/university-store';
import {contentRows} from '@/lib/platform-store';
import StudentPlatform,{type ContentRecord} from '@/app/student-platform';
import type {Language} from '@/app/content';
import {pageMetadata} from '@/app/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{lang:string;country:string;topic:string}>}){const{lang,country,topic}=await params;const c=(await contentRows()).find(r=>r.kind==='guide'&&String(r.content.countryCode).toLowerCase()===country&&r.content.slug===topic);const title=c?.content.title as Record<string,string>|undefined;return c?pageMetadata(lang as Language,`guides/${country}/${topic}`,`${title?.[lang]} — Creator Group`,title?.[lang]||''):{};}
export default async function Page({params}:{params:Promise<{lang:string;country:string;topic:string}>}){const{lang,country,topic}=await params;if(!['fa','en','tr'].includes(lang))notFound();const content=await contentRows() as ContentRecord[],record=content.find(r=>r.kind==='guide'&&r.content.countryCode?.toLowerCase()===country&&r.content.slug===topic);if(!record)notFound();return <StudentPlatform lang={lang as Language} mode="guide" universities={await listUniversities()} content={content} record={record}/>;}
