import {z} from 'zod';
import {getCountry} from '@/lib/country-store';
import {countryAnswer} from '@/lib/country-model';
import {readJSON,sameOrigin,limited} from '@/lib/platform-security';
export async function POST(r:Request,{params}:{params:Promise<{slug:string}>}){if(!sameOrigin(r))return Response.json({error:'Invalid origin'},{status:403});try{if(await limited(r,'country-assistant',30))return Response.json({error:'Please retry later'},{status:429});const p=z.object({question:z.string().trim().min(3).max(500),language:z.enum(['fa','en','tr'])}).parse(await readJSON(r,4000));const c=await getCountry((await params).slug);if(!c)return Response.json({error:'Country not found'},{status:404});return Response.json(countryAnswer(c,p.question,p.language),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Please check your question and retry'},{status:400});}}
