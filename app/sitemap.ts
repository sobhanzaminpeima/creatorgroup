import type {MetadataRoute} from 'next';
import {intlPaths} from './international-pages';
import {listUniversities} from '@/lib/university-store';
import {contentRows} from '@/lib/platform-store';
import {settings} from './international-data';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const universities=await listUniversities();const content=await contentRows();const paths=['',...intlPaths.filter(p=>p!=='track-request'&&!p.startsWith('university-prices/')),'services','universities','hotels','flights','accommodation','airport-transfer','cities/istanbul',...universities.map(u=>'universities/'+u.slug),...universities.flatMap(u=>u.programs.filter(p=>!p.sourceVersion||p.sourceVersion==='25-15').map(p=>'programs/'+u.slug+'/'+p.id)),...content.filter(r=>r.kind==='guide').map(r=>'guides/'+String(r.content.countryCode).toLowerCase()+'/'+r.content.slug),...content.filter(r=>r.kind==='city').map(r=>'cities/'+r.content.slug)];return ['fa','en','tr'].flatMap(lang=>[...new Set(paths)].map(path=>({url:`${settings.origin}/${lang}${path?'/'+path:''}`,lastModified:new Date('2026-10-03'),alternates:{languages:Object.fromEntries([...['fa','en','tr'].map(l=>[l,`${settings.origin}/${l}${path?'/'+path:''}`]),['x-default',`${settings.origin}/fa${path?'/'+path:''}`]])}})));}
