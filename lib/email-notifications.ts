import {execFile} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {getRawDb} from '@/db/raw';
export type EmailLead={code:string;name:string;phone:string;email:string;service:string;country?:string;destination?:string;message?:string;details?:Record<string,string>;method?:string;time?:string;language?:string};
export function emailConfigured(){return process.env.LEAD_EMAIL_DISABLED!=='1'&&existsSync('/usr/sbin/hsendmail');}
export function emailMessage(lead:EmailLead){
 const medical=lead.service.startsWith('medical');
 const lines=['Creator Group — درخواست جدید / New inquiry',`کد پیگیری / Reference: ${lead.code}`,`نام / Name: ${lead.name}`,`تلفن / Phone: ${lead.phone||'—'}`,`ایمیل / Email: ${lead.email}`,`خدمت / Service: ${lead.service}`,`کشور / Country: ${lead.country||'—'}`,`مقصد / Destination: ${lead.destination||'—'}`,`روش تماس / Contact preference: ${lead.method||'—'}`,`زمان تماس / Contact time: ${lead.time||'—'}`];
 if(medical){lines.push('Medical details and documents remain in the private website record and are not emailed.');}
 else{lines.push('',`پیام / Message:\n${lead.message||'—'}`);for(const [key,value] of Object.entries(lead.details||{}))lines.push(`${key}: ${value}`);}
 lines.push('','کلید خصوصی پیگیری و فایل‌های ضمیمه در این ایمیل قرار نمی‌گیرند.','Private tracking keys and attachments are not included.');
 return {subject:`Creator Group - New lead ${lead.code}`,body:lines.join('\n'),replyTo:lead.email};
}
export function sendEmail(message:ReturnType<typeof emailMessage>):Promise<void>{return new Promise((resolvePromise,reject)=>{
 const child=execFile(process.env.LEAD_EMAIL_PHP_BIN||'php',[resolve(process.cwd(),'scripts/send-lead-email.php')],{timeout:10000,maxBuffer:4096},(error,stdout)=>{if(error||stdout.trim()!=='MAIL_ACCEPTED')reject(Error('Mail service unavailable'));else resolvePromise();});
 child.stdin?.on('error',()=>{});child.stdin?.end(JSON.stringify(message));
});}
export async function notifyLead(id:string,lead:EmailLead):Promise<'accepted'|'pending'|'unavailable'>{
 try{const db=getRawDb();await db.prepare('INSERT INTO email_notifications (id,payload,status,attempts,next_attempt_at,updated_at) VALUES (?,?,?,0,?,?) ON CONFLICT(id) DO NOTHING').bind(id,JSON.stringify(emailMessage(lead)),'pending',Date.now(),Date.now()).run();return await dispatchEmail(id);}catch{console.error('Lead email notification pending');return 'unavailable';}
}
export async function dispatchEmail(id:string):Promise<'accepted'|'pending'|'unavailable'>{
 if(!emailConfigured())return 'unavailable';
 const db=getRawDb();const row=await db.prepare('SELECT payload,status,attempts,next_attempt_at FROM email_notifications WHERE id=?').bind(id).first<{payload:string;status:string;attempts:number;next_attempt_at:number}>();
 if(!row)return 'unavailable';if(row.status==='accepted')return 'accepted';if(row.status!=='pending'||row.next_attempt_at>Date.now())return 'pending';
 const now=Date.now();const claimed=await db.prepare("UPDATE email_notifications SET status='sending', attempts=attempts+1, updated_at=? WHERE id=? AND status='pending' AND attempts=?").bind(now,id,row.attempts).run();if(!claimed.meta.changes)return 'pending';
 try{await sendEmail(JSON.parse(row.payload) as ReturnType<typeof emailMessage>);await db.prepare("UPDATE email_notifications SET status='accepted',updated_at=? WHERE id=?").bind(Date.now(),id).run();return 'accepted';}
 catch{await db.prepare("UPDATE email_notifications SET status='pending',next_attempt_at=?,updated_at=? WHERE id=?").bind(Date.now()+900000,Date.now(),id).run();console.error('Lead email queued for retry');return 'pending';}
}
