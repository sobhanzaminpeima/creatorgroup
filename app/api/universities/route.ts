import {listUniversities} from '@/lib/university-store';
export const dynamic='force-dynamic';
export async function GET(r:Request){const all=await listUniversities();return Response.json({universities:new URL(r.url).searchParams.has('summary')?all.map(u=>({slug:u.slug,legacySlug:u.legacySlug,name:u.name,image:u.heroImage})):all},{headers:{'Cache-Control':'no-store'}});}
