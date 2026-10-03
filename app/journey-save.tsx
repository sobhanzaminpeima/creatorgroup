'use client';
import {useEffect,useState} from 'react';
import {Heart,Check,ArrowUpRight} from 'lucide-react';
import type {Language} from './content';
import {T} from './international-data';
import {useJourneyDraft} from './journey-draft-hooks';
import {toggleGuestSave,type GuestSave} from '@/lib/journey-draft';
export default function JourneySave({lang,item,className='ux-secondary'}:{lang:Language;item:GuestSave;className?:string}){
 const {draft}=useJourneyDraft();const [accountSaved,setAccountSaved]=useState(false),[loggedIn,setLoggedIn]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const c=new AbortController();fetch('/api/student',{signal:c.signal,cache:'no-store'}).then(r=>r.ok?r.json() as Promise<{student:unknown;saved:GuestSave[]}>:null).then(d=>{if(c.signal.aborted)return;setLoggedIn(!!d?.student);setAccountSaved(!!d?.saved?.some((s:GuestSave)=>s.kind===item.kind&&s.itemId===item.itemId));}).catch(()=>{});return()=>c.abort();},[item.kind,item.itemId]);
 const saved=loggedIn?accountSaved:draft.saved.some(s=>s.kind===item.kind&&s.itemId===item.itemId);
 return <span className="sj-save"><button type="button" className={`${className}${saved?' active':''}`} aria-pressed={saved} disabled={busy} onClick={async()=>{setError('');if(!loggedIn){toggleGuestSave(item);return;}setBusy(true);try{const r=await fetch('/api/student',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:saved?'unsave':'save',...item})});if(r.status===401){setLoggedIn(false);toggleGuestSave(item);return;}if(!r.ok)throw Error();setAccountSaved(!saved);}catch{setError(T('ذخیره نشد؛ دوباره تلاش کنید.','Could not save. Please retry.','Kaydedilemedi. Tekrar deneyin.')[lang]);}finally{setBusy(false);}}}>{saved?<Check size={15}/>:<Heart size={15}/>} {saved?T('ذخیره شد','Saved','Kaydedildi')[lang]:T('ذخیره','Save','Kaydet')[lang]}</button>{error&&<small role="alert">{error}</small>}{!loggedIn&&saved&&draft.saved.length>=2&&<a href={`/${lang}/journey`}>{T('مسیرم را نگه دار','Keep My Journey','Yolculuğumu sakla')[lang]} <ArrowUpRight size={12}/></a>}</span>;
}
