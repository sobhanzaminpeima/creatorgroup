import {z} from 'zod';

/** Discovery choices only. Contact details, credentials and documents never belong here. */
export const JOURNEY_DRAFT_KEY='creator-journey-draft-v1';
export const JOURNEY_DRAFT_EVENT='creator-journey-draft';
export const countrySlugs={TR:'turkiye',DE:'germany',NL:'netherlands',CY:'cyprus',CN:'china',RU:'russia',ES:'spain'} as const;
export const fieldKeys=['all','dentistry','medicine','pharmacy','engineering','architecture','computer-science','business','gastronomy','aviation','law'] as const;
const identity=z.string().min(1).max(300).regex(/^[a-zA-Z0-9][a-zA-Z0-9_./,:-]*$/);
export const preferencesSchema=z.object({
 field:z.enum(fieldKeys).default('all'),countryCode:z.enum(['TR','DE','NL','CY','CN','RU','ES']).optional(),
 language:z.enum(['Any','English','Turkish','German','Spanish','Russian','Chinese','Dutch']).default('Any'),
 degree:z.enum(['bachelor','master','phd','associate','other']).optional(),budget:z.number().finite().min(0).max(250000).nullable().default(null),
 intake:z.string().regex(/^20\d{2}(?:-(?:spring|fall))?$/).optional(),
});
export const guestSaveSchema=z.object({kind:z.enum(['country','university','program','comparison','guide','accommodation','hotel']),itemId:identity,
 content:z.object({title:z.string().max(180).optional(),universitySlug:identity.optional(),programId:identity.optional(),countryCode:z.enum(['TR','DE','NL','CY','CN','RU','ES']).optional(),universities:z.array(identity).min(1).max(4).optional()}).default({})});
export const journeyDraftSchema=z.object({version:z.literal(1),preferences:preferencesSchema,saved:z.array(guestSaveSchema).max(100),updatedAt:z.number().finite().nonnegative()});
export type JourneyPreferences=z.infer<typeof preferencesSchema>;
export type GuestSave=z.infer<typeof guestSaveSchema>;
export type JourneyDraft=z.infer<typeof journeyDraftSchema>;
export function emptyDraft():JourneyDraft{return {version:1,preferences:preferencesSchema.parse({}),saved:[],updatedAt:0};}
export function sanitizeDraft(value:unknown,now=Date.now()):JourneyDraft{const p=journeyDraftSchema.safeParse(value);if(!p.success||p.data.updatedAt>now+60000||p.data.updatedAt<now-90*86400000)return emptyDraft();const unique=new Map(p.data.saved.map(s=>[`${s.kind}:${s.itemId}`,s]));return {...p.data,saved:[...unique.values()]};}
export function readDraft():JourneyDraft{if(typeof window==='undefined')return emptyDraft();try{const raw=window.localStorage.getItem(JOURNEY_DRAFT_KEY);if(!raw||raw.length>50000)return emptyDraft();return sanitizeDraft(JSON.parse(raw));}catch{return emptyDraft();}}
function writeDraft(draft:JourneyDraft){if(typeof window==='undefined')return draft;try{window.localStorage.setItem(JOURNEY_DRAFT_KEY,JSON.stringify(draft));window.dispatchEvent(new Event(JOURNEY_DRAFT_EVENT));}catch{/* Discovery remains usable if browser storage is unavailable. */}return draft;}
export function setPreferences(partial:Partial<JourneyPreferences>){const draft=readDraft(),preferences=preferencesSchema.parse({...draft.preferences,...partial});return writeDraft({...draft,preferences,updatedAt:Date.now()});}
export function toggleGuestSave(value:GuestSave){const item=guestSaveSchema.parse(value),draft=readDraft(),key=`${item.kind}:${item.itemId}`;const present=draft.saved.some(s=>`${s.kind}:${s.itemId}`===key);return writeDraft({...draft,saved:present?draft.saved.filter(s=>`${s.kind}:${s.itemId}`!==key):[...draft.saved,item].slice(-100),updatedAt:Date.now()});}
export function clearDraft(){if(typeof window==='undefined')return;try{window.localStorage.removeItem(JOURNEY_DRAFT_KEY);window.dispatchEvent(new Event(JOURNEY_DRAFT_EVENT));}catch{}}
/** Clear only the imported snapshot; choices made during the request remain on this device. */
export function clearImportedDraft(snapshot:JourneyDraft){const current=readDraft();if(JSON.stringify(current)===JSON.stringify(snapshot))clearDraft();}
export function profileCompletion(profile:Record<string,unknown>,preferences:Partial<JourneyPreferences>){const fields=[profile.firstName,profile.lastName,profile.phone,profile.homeCountry,profile.education,preferences.countryCode,preferences.field&&preferences.field!=='all',preferences.language&&preferences.language!=='Any',preferences.degree,preferences.budget!==null&&preferences.budget!==undefined];return Math.round(fields.filter(Boolean).length/fields.length*100);}
