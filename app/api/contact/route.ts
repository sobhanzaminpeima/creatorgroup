import {notifyLead} from '@/lib/email-notifications';
import {sameOrigin} from '@/lib/request-security';
import { z } from 'zod';
import { getRawDb } from '@/db/raw';
const schema=z.object({id:z.string().uuid(),name:z.string().trim().min(2).max(150),company:z.string().trim().max(200),email:z.string().email().max(254),phone:z.string().trim().max(50),country:z.string().trim().max(100),industry:z.string().max(100),interest:z.enum(['reception','calls','web','mobile','custom']),message:z.string().trim().min(10).max(5000),language:z.enum(['en','tr','fa']),website:z.string().max(0)});
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Invalid origin'},{status:403});
 if(Number(request.headers.get('content-length')||0)>12000)return Response.json({error:'Request too large'},{status:413});
 let data;try{data=schema.safeParse(await request.json());}catch{return Response.json({error:'Invalid request'},{status:400});}
 if(!data.success)return Response.json({error:'Please check your details'},{status:400});
 const p=data.data;
 try{await getRawDb().prepare('INSERT INTO inquiries (id,name,company,email,phone,country,industry,interest,message,language,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(p.id,p.name,p.company,p.email,p.phone,p.country,p.industry,p.interest,p.message,p.language,Date.now()).run();const lead=await getRawDb().prepare('SELECT name,email,phone,interest,message,country FROM inquiries WHERE id=?').bind(p.id).first<{name:string;email:string;phone:string;interest:string;message:string;country:string}>();const notification=lead?await notifyLead(p.id,{code:'CG-'+p.id.replace(/-/g,'').slice(0,16).toUpperCase(),name:lead.name,email:lead.email,phone:lead.phone,service:lead.interest,message:lead.message,country:lead.country}):'unavailable';return Response.json({saved:true,notification},{status:201});}
 catch(e){console.error('Inquiry storage unavailable',e);return Response.json({error:'Please try again shortly'},{status:503});}
}
