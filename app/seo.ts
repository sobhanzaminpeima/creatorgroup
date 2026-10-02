import type {Metadata} from 'next';
import type {Language} from './content';
import {settings} from './international-data';
import {resolvePage} from './international-pages';
import {universityVisuals} from './university-visuals';

export function serviceImage(slug:string){return slug==='medical/dentistry'?'/images/services/dentistry.webp':slug==='medical/treatment'?'/images/services/treatment.webp':`/images/services/${slug}.jpg`;}
export function pageImage(path:string){
 const page=resolvePage(path);
 if(page?.university)return universityVisuals[page.university.slug as keyof typeof universityVisuals].image;
 if(page?.service)return serviceImage(page.service.slug);
 if(page?.article)return page.article.slug==='application-documents'?'/images/international-journal.webp':serviceImage(page.article.service);
 return '/images/international-hero.webp';
}
export const languageAlternates=(path:string)=>Object.fromEntries([...['fa','en','tr'].map(l=>[l,`${settings.origin}/${l}${path?'/'+path:''}`]),['x-default',`${settings.origin}/fa${path?'/'+path:''}`]]);
export function pageMetadata(lang:Language,path:string,title:string,description:string):Metadata{
 const url=`${settings.origin}/${lang}${path?'/'+path:''}`;
 const image={url:settings.origin+pageImage(path),alt:title};
 return {title,description,alternates:{canonical:url,languages:languageAlternates(path)},robots:path==='track-request'?{index:false,follow:true}:undefined,
 openGraph:{title,description,url,siteName:settings.brand,type:resolvePage(path)?.type==='article'?'article':'website',locale:{fa:'fa_IR',en:'en_US',tr:'tr_TR'}[lang],alternateLocale:['fa','en','tr'].filter(l=>l!==lang).map(l=>({fa:'fa_IR',en:'en_US',tr:'tr_TR'})[l as Language]),images:[image]},twitter:{card:'summary_large_image',title,description,images:[image.url]}};
}
export function pageSchema(lang:Language,path:string){
 const page=resolvePage(path)!;const url=`${settings.origin}/${lang}${path?'/'+path:''}`;const organization=`${settings.origin}/#organization`;
 const graph:Record<string,unknown>[]=[{'@type':'Organization','@id':organization,name:settings.brand,url:settings.origin,logo:{'@type':'ImageObject',url:`${settings.origin}/brand/creator-logo.webp`}}, {'@type':'WebSite','@id':`${settings.origin}/#website`,name:settings.brand,url:settings.origin,publisher:{'@id':organization},inLanguage:['fa','en','tr']}, {'@type':page.type==='article'?'Article':'WebPage','@id':url+'#page',url,name:page.title[lang],description:page.description[lang],inLanguage:lang,isPartOf:{'@id':`${settings.origin}/#website`},image:settings.origin+pageImage(path),...(page.type==='article'?{headline:page.title[lang],datePublished:'2026-10-02',dateModified:'2026-10-02',author:{'@id':organization},publisher:{'@id':organization},mainEntityOfPage:url}:{})}];
 if(path){const items=[{'@type':'ListItem',position:1,name:{fa:'خانه',en:'Home',tr:'Ana Sayfa'}[lang],item:`${settings.origin}/${lang}`}];const parts=path.split('/');parts.forEach((_,i)=>{const part=parts.slice(0,i+1).join('/');const p=resolvePage(part);if(p)items.push({'@type':'ListItem',position:items.length+1,name:p.title[lang],item:`${settings.origin}/${lang}/${part}`})});graph.push({'@type':'BreadcrumbList',itemListElement:items});}
 if(page.type==='service')graph.push({'@type':'Service',name:page.title[lang],description:page.description[lang],url,image:settings.origin+pageImage(path),provider:{'@id':organization}});
 if(page.university)graph.push({'@type':'CollegeOrUniversity',name:page.university.name[lang],image:settings.origin+pageImage(path),url:universityVisuals[page.university.slug as keyof typeof universityVisuals].website});
 return {'@context':'https://schema.org','@graph':graph};
}
