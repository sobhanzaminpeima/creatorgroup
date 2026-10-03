import {getRawDb} from '@/db/raw';
import {dispatchEmail,emailConfigured} from './email-notifications';
export async function retryPendingEmails(){
 const db=getRawDb();await db.prepare("UPDATE email_notifications SET status='pending',next_attempt_at=? WHERE status='sending' AND updated_at<?").bind(Date.now(),Date.now()-600000).run();
 let processed=0;for(let i=0;i<5;i++){const row=await db.prepare("SELECT id FROM email_notifications WHERE status='pending' AND next_attempt_at<=? ORDER BY next_attempt_at LIMIT 1").bind(Date.now()).first<{id:string}>();if(!row)break;await dispatchEmail(row.id);processed++;}return processed;
}
export function startEmailRetries(){
 if(!emailConfigured()||process.env.NEXT_PHASE==='phase-production-build')return;
 const state=globalThis as typeof globalThis&{creatorEmailTimer?:ReturnType<typeof setInterval>};if(state.creatorEmailTimer)return;
 let running=false;const tick=async()=>{if(running)return;running=true;try{await retryPendingEmails();}catch{console.error('Email retry worker will retry later');}finally{running=false;}};
 state.creatorEmailTimer=setInterval(()=>void tick(),300000);state.creatorEmailTimer.unref();void tick();
}
