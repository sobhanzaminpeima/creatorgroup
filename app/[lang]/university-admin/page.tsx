import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import UniversityAdmin from '@/app/university-admin';
import type {Language} from '@/app/content';
export const metadata:Metadata={title:'Creator Group Admin',robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{lang:string}>}){const{lang}=await params;if(!['fa','en','tr'].includes(lang))notFound();return <UniversityAdmin lang={lang as Language}/>;}
