import {programFields,programField} from '@/lib/program-fields';
import {earthDestinations} from '@/lib/earth-destinations';
import {listUniversities} from '@/lib/university-store';
export const dynamic='force-dynamic';
export async function GET(r:Request){const all=await listUniversities();if(new URL(r.url).searchParams.has('destinations'))return Response.json({destinations:earthDestinations.map(d=>{const list=all.filter(u=>u.countryCode===d.code);return {...d,universityCount:list.length,popularFields:programFields.filter(f=>list.some(u=>u.programs.some(p=>programField(p.name)?.key===f.key))).slice(0,3).map(f=>f.title)};})},{headers:{'Cache-Control':'public, max-age=60'}});return Response.json({universities:new URL(r.url).searchParams.has('summary')?all.map(u=>({slug:u.slug,legacySlug:u.legacySlug,name:u.name,image:u.heroImage})):all},{headers:{'Cache-Control':'no-store'}});}
