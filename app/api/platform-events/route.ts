import {z} from 'zod';
import {getRawDb} from '@/db/raw';
import {getUniversity} from '@/lib/university-store';
import {sameOrigin,readJSON,limited} from '@/lib/platform-security';
const schema=z.object({event:z.enum(['university_view','campus_explore','program_view','eligibility_started','eligibility_completed','application_started','application_submitted','review_viewed','university_saved','comparison_created','hotel_search','flight_search','transfer_requested']),university:z.string().max(100).optional(),consent:z.literal(true)});
export async function POST(r:Request){if(!sameOrigin(r))return new Response(null,{status:403});try{if(await limited(r,'product-events',100))return new Response(null,{status:429});const p=schema.parse(await readJSON(r,2000));const u=p.university?await getUniversity(p.university):null;await getRawDb().prepare('INSERT INTO platform_events(id,event,university_id,created_at) VALUES(?,?,?,?)').bind(crypto.randomUUID(),p.event,u?.id||null,Date.now()).run();return new Response(null,{status:204});}catch{return new Response(null,{status:400});}}
