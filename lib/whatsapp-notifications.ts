import {getRawDb} from '@/db/raw';
import {leadWhatsAppNumber} from './whatsapp-link';
type Lead={code:string;name:string;phone:string;email:string;service:string};
export function whatsappConfigured(){return process.env.LEAD_NOTIFICATION_CHANNEL==='whatsapp'&&!!(process.env.WHATSAPP_ACCESS_TOKEN&&process.env.WHATSAPP_PHONE_NUMBER_ID&&process.env.WHATSAPP_TEMPLATE_NAME);}
export async function notifyLead(id:string,lead:Lead):Promise<'accepted'|'pending'|'unavailable'>{
 try{const db=getRawDb();await db.prepare('INSERT INTO whatsapp_notifications (id,payload,status,attempts,next_attempt_at,updated_at) VALUES (?,?,?,0,?,?) ON CONFLICT(id) DO NOTHING').bind(id,JSON.stringify(lead),'pending',Date.now(),Date.now()).run();return await dispatchNotification(id);}catch{console.error('WhatsApp notification queue unavailable');return 'unavailable';}
}
export async function dispatchNotification(id:string):Promise<'accepted'|'pending'|'unavailable'>{
 if(!whatsappConfigured())return 'unavailable';
 const db=getRawDb();const row=await db.prepare('SELECT payload,status,attempts,next_attempt_at FROM whatsapp_notifications WHERE id=?').bind(id).first<{payload:string;status:string;attempts:number;next_attempt_at:number}>();
 if(!row)return 'unavailable';if(row.status==='accepted')return 'accepted';if(row.status!=='pending'||row.attempts>=3||row.next_attempt_at>Date.now())return 'pending';
 const now=Date.now();const claimed=await db.prepare("UPDATE whatsapp_notifications SET status='sending', attempts=attempts+1, updated_at=? WHERE id=? AND status='pending' AND attempts=?").bind(now,id,row.attempts).run();
 if(!claimed.meta.changes)return 'pending';
 try{
  const lead=JSON.parse(row.payload) as Lead;
  const version=process.env.WHATSAPP_GRAPH_VERSION||'v25.0';if(!/^v\d+\.\d+$/.test(version)||!/^\d+$/.test(process.env.WHATSAPP_PHONE_NUMBER_ID!))throw Error('Invalid configuration');
  const response=await fetch(`https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,{method:'POST',headers:{Authorization:`Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(8000),body:JSON.stringify({messaging_product:'whatsapp',to:leadWhatsAppNumber,type:'template',template:{name:process.env.WHATSAPP_TEMPLATE_NAME,language:{code:process.env.WHATSAPP_TEMPLATE_LANGUAGE||'en'},components:[{type:'body',parameters:[lead.code,lead.name,lead.phone||'—',lead.email,lead.service].map(text=>({type:'text',text:text.replace(/\s+/g,' ').slice(0,250)}))}]}})});
  if(!response.ok)throw Error('Provider rejected notification');const result=await response.json() as {messages?:{id?:string}[]};const messageId=result.messages?.[0]?.id;if(typeof messageId!=='string')throw Error('Missing message ID');
  await db.prepare("UPDATE whatsapp_notifications SET status='accepted',provider_id=?,updated_at=? WHERE id=?").bind(messageId,Date.now(),id).run();return 'accepted';
 }catch{await db.prepare("UPDATE whatsapp_notifications SET status='pending',next_attempt_at=?,updated_at=? WHERE id=?").bind(Date.now()+300000,Date.now(),id).run();console.error('WhatsApp notification pending retry');return 'pending';}
}
