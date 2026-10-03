import type { MetadataRoute } from 'next';
import {settings} from './international-data';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/fa/university-admin','/en/university-admin','/tr/university-admin','/fa/journey','/en/journey','/tr/journey']},sitemap:`${settings.origin}/sitemap.xml`};}
