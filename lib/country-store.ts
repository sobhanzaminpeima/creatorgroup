import 'server-only';
import {getRawDb} from '@/db/raw';
import {countrySchema,type Country} from './country-model';
import {countrySeeds} from './country-seeds';
export async function listCountries(includeDrafts=false):Promise<Country[]>{
 const merged=new Map(countrySeeds.map(c=>[c.code,c]));
 try{const row=await getRawDb().prepare('SELECT json_group_array(json(content)) AS items FROM country_intelligence').first<{items:string}>();for(const item of JSON.parse(row?.items||'[]')){const parsed=countrySchema.safeParse(item);if(parsed.success)merged.set(parsed.data.code,parsed.data);}}
 catch(error){if(process.env.NODE_ENV!=='production')console.error('Country CMS unavailable',error);}
 return [...merged.values()].filter(c=>includeDrafts||c.published);
}
export async function getCountry(slugOrCode:string){return(await listCountries()).find(c=>c.slug===slugOrCode.toLowerCase()||c.code===slugOrCode.toUpperCase());}
export async function saveCountry(country:Country){await getRawDb().prepare('INSERT INTO country_intelligence(code,slug,content,updated_at) VALUES(?,?,?,?) ON CONFLICT(code) DO UPDATE SET slug=excluded.slug,content=excluded.content,updated_at=excluded.updated_at').bind(country.code,country.slug,JSON.stringify(country),Date.now()).run();}
