import {getRawDb} from '@/db/raw';
import {digest,sameOrigin} from '@/lib/request-security';
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Invalid origin'},{status:403});
 try{const p=await request.json() as {code:string,key:string};if(typeof p.code!=='string'||typeof p.key!=='string'||!/^CG-[A-F0-9]{16}$/.test(p.code.toUpperCase())||!/^[a-f0-9]{64}$/.test(p.key))return Response.json({error:'Not found'},{status:404});const row=await getRawDb().prepare('SELECT code,service,status,created_at FROM international_requests WHERE code=? AND key_hash=?').bind(p.code.toUpperCase(),await digest(p.key)).first();if(!row)return Response.json({error:'Not found'},{status:404});return Response.json({request:row},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Unavailable'},{status:503});}
}
