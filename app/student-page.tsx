import {notFound} from 'next/navigation';
import {listUniversities} from '@/lib/university-store';
import {contentRows} from '@/lib/platform-store';
import StudentPlatform,{type ContentRecord} from './student-platform';
import {platformTitles} from '@/lib/platform-copy';
import type {Language} from './content';
export async function renderStudentPage(mode:keyof typeof platformTitles,params:Promise<{lang:string}>,searchParams?:Promise<Record<string,string|string[]|undefined>>){const {lang}=await params;if(!['fa','en','tr'].includes(lang))notFound();const q=await searchParams||{},universities=await listUniversities(),university=universities.find(u=>u.slug===q.university||u.legacySlug===q.university);return <StudentPlatform lang={lang as Language} mode={mode} universities={universities} content={await contentRows() as ContentRecord[]} university={university} selected={typeof q.universities==='string'?q.universities.split(','):[]} query={typeof q.q==='string'?q.q:''} initialTab={typeof q.tab==='string'?q.tab:''} programId={typeof q.program==='string'?q.program:''}/>;}
