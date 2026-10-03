import {T} from '@/app/international-data';
import type {University} from './university-model';
export const degreeNames={all:T('همه','All','Tümü'),bachelor:T('کارشناسی','Bachelor','Lisans'),master:T('کارشناسی ارشد','Master','Yüksek lisans'),phd:T('دکترا','PhD','Doktora'),associate:T('کاردانی','Associate','Ön lisans'),other:T('سایر / مقطع تأییدنشده','Other / degree to confirm','Diğer / derece teyit edilmeli')};
export const feeBasis={annual:T('سالانه','Annual','Yıllık'),program:T('کل برنامه','Total programme','Tüm program'),source:T('دورهٔ پرداخت نیازمند تأیید','Billing period to confirm','Ödeme dönemi teyit edilmeli')};
function plainPrice(s:string){const cleaned=s.replace(/[^\d.,]/g,'');return Number(cleaned.includes(',')&&/\,\d{2}$/.test(cleaned)?cleaned.replace(/\./g,'').replace(',','.'):cleaned.replace(/,/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,''));}
export function annualMinimum(u:University){const p=u.programs.filter(p=>p.basis==='annual').map(p=>plainPrice(p.originalTuition)).filter(n=>n>0&&Number.isFinite(n));return p.length?Math.min(...p):null;}
