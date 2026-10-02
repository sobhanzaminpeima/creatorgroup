import type { MetadataRoute } from 'next';
import {settings} from './international-data';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:'/api/'},sitemap:`${settings.origin}/sitemap.xml`};}
