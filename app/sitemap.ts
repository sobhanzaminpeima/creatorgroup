import type {MetadataRoute} from 'next';
import {intlPaths} from './international-pages';
import {settings} from './international-data';
export default function sitemap():MetadataRoute.Sitemap{return ['fa','en','tr'].flatMap(lang=>['',...intlPaths.filter(p=>p!=='track-request'),'services'].map(path=>({url:`${settings.origin}/${lang}${path?'/'+path:''}`,lastModified:new Date('2026-10-02'),alternates:{languages:Object.fromEntries(['fa','en','tr'].map(l=>[l,`${settings.origin}/${l}${path?'/'+path:''}`]))}})));}
