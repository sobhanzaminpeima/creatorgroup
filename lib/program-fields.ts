type Localized={fa:string;en:string;tr:string};
const label=(fa:string,en:string,tr:string):Localized=>({fa,en,tr});
export const programFields=[
 {key:'dentistry',title:label('دندان‌پزشکی','Dentistry','Diş hekimliği'),image:'/images/services/dentistry.webp',tags:['diş hekim','dentist','دندان']},
 {key:'medicine',title:label('پزشکی','Medicine','Tıp'),image:'/images/services/treatment.webp',tags:['tıp','medicine','پزشکی']},
 {key:'pharmacy',title:label('داروسازی','Pharmacy','Eczacılık'),image:'/images/fields/pharmacy.webp',tags:['eczac','pharma','داروسازی']},
 {key:'computer-science',title:label('علوم کامپیوتر','Computer Science','Bilgisayar bilimi'),image:'/images/fields/computer-science.webp',tags:['bilgisayar','yazılım','yapay zeka','computer','software','کامپیوتر','نرم افزار']},
 {key:'engineering',title:label('مهندسی','Engineering','Mühendislik'),image:'/images/fields/engineering.webp',tags:['mühendis','engineering','مهندسی']},
 {key:'architecture',title:label('معماری','Architecture','Mimarlık'),image:'/images/fields/architecture.webp',tags:['mimarl','architecture','معماری']},
 {key:'gastronomy',title:label('هنر آشپزی','Gastronomy','Gastronomi'),image:'/images/fields/gastronomy.webp',tags:['gastronomi','aşçılık','culinary','gastronomy','آشپزی']},
 {key:'aviation',title:label('هوانوردی','Aviation','Havacılık'),image:'/images/fields/aviation.webp',tags:['havacılık','pilotaj','uçak','aviation','pilot','هوانوردی']},
 {key:'law',title:label('حقوق','Law','Hukuk'),image:'/images/fields/law.webp',tags:['hukuk','law','حقوق']},
 {key:'business',title:label('مدیریت و کسب‌وکار','Business','İşletme'),image:'/images/fields/business.webp',tags:['işletme','ekonomi','iktisat','finans','yönetim','business','econom','management','مدیریت']},
] as const;
export type FieldKey=typeof programFields[number]['key']|'all';
export function normalizeProgram(value:string){return value.toLocaleLowerCase('tr').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/ي/g,'ی').replace(/ك/g,'ک');}
export function programField(name:string){const v=normalizeProgram(name);return programFields.find(f=>f.tags.some(t=>v.includes(normalizeProgram(t))));}
export function programFieldImage(name:string){return programField(name)?.image||'/images/services/study-abroad.jpg';}
export const categoryVisual=label('تصویر معرفی رشته؛ امکانات واقعی دانشگاه نیست','Program category visual; not a university facility','Programı tanıtan görsel; üniversite tesisi değildir');
export function searchProgram(value:string,query:string){const normalize=(s:string)=>normalizeProgram(s).replace(/dentistry|دندان.?پزشکی/g,'dis').replace(/medicine|پزشکی/g,'tip').replace(/english|انگلیسی/g,'ingilizce').replace(/turkish|ترکی/g,'turkce');return normalize(query).split(/\s+/).filter(Boolean).every(t=>normalize(value).includes(t));}
