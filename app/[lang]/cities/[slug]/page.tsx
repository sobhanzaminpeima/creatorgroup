import {notFound} from 'next/navigation';
import {listUniversities} from '@/lib/university-store';
import {contentRows} from '@/lib/platform-store';
import StudentPlatform,{type ContentRecord} from '@/app/student-platform';
import type {Language} from '@/app/content';
import {pageMetadata} from '@/app/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{lang:string;slug:string}>}){const{lang,slug}=await params;const c=(await contentRows()).find(r=>r.kind==='city'&&r.content.slug===slug);const t=c?.content.title as Record<string,string>|undefined;return pageMetadata(lang as Language,`cities/${slug}`,t?.[lang]||'Istanbul — Creator Group',t?.[lang]||'Plan your university journey in Istanbul.');}
export default async function Page({params,searchParams}:{params:Promise<{lang:string;slug:string}>;searchParams:Promise<{university?:string}>}){const{lang,slug}=await params;if(!['fa','en','tr'].includes(lang))notFound();const universities=await listUniversities(),content=await contentRows() as ContentRecord[],record=content.find(r=>r.kind==='city'&&r.content.slug===slug);if(slug!=='istanbul'&&!record&&!universities.some(u=>u.city.en.toLowerCase().replace(/[^a-z0-9]+/g,'-')===slug))notFound();const q=await searchParams;return <StudentPlatform lang={lang as Language} mode="city" universities={universities} content={content} record={record} university={universities.find(u=>u.slug===q.university)}/>;}
