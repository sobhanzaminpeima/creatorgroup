import {notFound} from 'next/navigation';
import {getUniversity} from '@/lib/university-store';
import StudentPlatform from '@/app/student-platform';
import type {Language} from '@/app/content';
import {pageMetadata} from '@/app/seo';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{lang:string;university:string;id:string}>}){const{lang,university,id}=await params,u=await getUniversity(university),p=u?.programs.find(p=>p.id===id);return p?pageMetadata(lang as Language,`programs/${university}/${id}`,`${p.name} — ${u!.name[lang as Language]}`,`${p.name}: ${p.originalTuition}. ${u!.name[lang as Language]}`):{};}
export default async function Page({params}:{params:Promise<{lang:string;university:string;id:string}>}){const{lang,university,id}=await params;if(!['fa','en','tr'].includes(lang))notFound();const u=await getUniversity(university);if(!u?.programs.some(p=>p.id===id))notFound();return <StudentPlatform lang={lang as Language} mode="program" universities={[u]} university={u} content={[]} programId={id}/>;}
