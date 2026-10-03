import {renderStudentPage} from '@/app/student-page';
import {pageMetadata} from '@/app/seo';
import {platformTitles} from '@/lib/platform-copy';
import type {Language} from '@/app/content';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{lang:string}>}){const {lang}=await params;const l=lang as Language;return {...pageMetadata(l,'compare',platformTitles['compare'][l]+' — Creator Group',platformTitles['compare'][l]),robots:{index:false,follow:true}};}
export default function Page({params,searchParams}:{params:Promise<{lang:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){return renderStudentPage('compare',params,searchParams);}
