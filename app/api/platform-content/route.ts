import {contentRows,reviewData} from '@/lib/platform-store';
import {getUniversity} from '@/lib/university-store';
export const dynamic='force-dynamic';
export async function GET(r:Request){const q=new URL(r.url).searchParams;try{if(q.has('university')){const u=await getUniversity(q.get('university')!);if(!u)return Response.json({error:'Not found'},{status:404});return Response.json(await reviewData(u.id,Math.max(0,Math.min(1000,Number(q.get('page'))||0))),{headers:{'Cache-Control':'no-store'}});}return Response.json({content:await contentRows()},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Content unavailable'},{status:503});}}
