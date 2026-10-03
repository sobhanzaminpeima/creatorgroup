import {getRawDb} from '@/db/raw';
import {dispatchNotification,whatsappConfigured} from '@/lib/whatsapp-notifications';
export async function POST(request:Request){
 const secret=process.env.WHATSAPP_RETRY_SECRET;if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`)return Response.json({error:'Unauthorized'},{status:401});
 if(!whatsappConfigured())return Response.json({error:'WhatsApp not configured'},{status:503});
 const db=getRawDb();
 // Recover interrupted attempts after a lease expires.
 await db.prepare("UPDATE whatsapp_notifications SET status='pending',next_attempt_at=? WHERE status='sending' AND updated_at<?").bind(Date.now(),Date.now()-600000).run();
 let processed=0;
 for(let i=0;i<5;i++){const row=await db.prepare("SELECT id FROM whatsapp_notifications WHERE status='pending' AND attempts<3 AND next_attempt_at<=? ORDER BY next_attempt_at LIMIT 1").bind(Date.now()).first<{id:string}>();if(!row)break;await dispatchNotification(row.id);processed++;}
 return Response.json({processed});
}
