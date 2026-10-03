import 'server-only';
import {getRawDb} from '@/db/raw';
import {universitySeeds} from './university-seeds';
import {universitySchema,type University} from './university-model';
export async function listUniversities(includeDrafts=false):Promise<University[]>{
 let overrides:University[]=[];
 try{const row=await getRawDb().prepare('SELECT json_group_array(json(content)) AS items FROM university_content').first<{items:string}>();overrides=JSON.parse(row?.items||'[]').map((v:unknown)=>universitySchema.parse(v));}
 catch(error){if(process.env.NODE_ENV!=='production')console.error('University CMS unavailable',error);}
 const merged=new Map(universitySeeds.map(u=>[u.slug,u]));for(const u of overrides)merged.set(u.slug,u);
 return [...merged.values()].filter(u=>includeDrafts||u.published);
}
export async function getUniversity(slug:string){return (await listUniversities()).find(u=>u.slug===slug||u.legacySlug===slug);}
export async function saveUniversity(u:University){await getRawDb().prepare('INSERT INTO university_catalog(id,slug) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug').bind(u.id,u.slug).run();await getRawDb().prepare('INSERT INTO university_content (slug,content,updated_at) VALUES (?,?,?) ON CONFLICT(slug) DO UPDATE SET content=excluded.content,updated_at=excluded.updated_at').bind(u.slug,JSON.stringify(u),Date.now()).run();}
