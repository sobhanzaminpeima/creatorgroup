'use client';
import {useEffect,useState} from 'react';
import {JOURNEY_DRAFT_KEY,JOURNEY_DRAFT_EVENT,readDraft,emptyDraft,setPreferences,toggleGuestSave,clearDraft} from '@/lib/journey-draft';
export function useJourneyDraft(){const [draft,setDraft]=useState(emptyDraft);useEffect(()=>{const refresh=()=>setDraft(readDraft());const storage=(e:StorageEvent)=>{if(e.key===JOURNEY_DRAFT_KEY||e.key===null)refresh();};refresh();window.addEventListener(JOURNEY_DRAFT_EVENT,refresh);window.addEventListener('storage',storage);return()=>{window.removeEventListener(JOURNEY_DRAFT_EVENT,refresh);window.removeEventListener('storage',storage);};},[]);return {draft,setPreferences,toggleGuestSave,clearDraft};}
