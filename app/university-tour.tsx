'use client';
import {useRef,useState} from 'react';
import {ExternalLink,Maximize,Rotate3D} from 'lucide-react';
import {T} from './international-data';
import type {Language} from './content';
import {universityVisuals} from './university-visuals';

const tours:Record<string,{source:string;scenes:{label:string;url:string}[]}>= {
  atlas:{source:'https://www.atlas.edu.tr/sanaltur/',scenes:[{label:'Vadi',url:'https://www.atlas.edu.tr/sanaltur/'}]},
  medipol:{source:'https://sanaltur.medipol.edu.tr/',scenes:[{label:'Medipol',url:'https://sanaltur.medipol.edu.tr/'}]},
  kent:{source:'https://www.kent.edu.tr/sanal-tur-0247164',scenes:[{label:'Kağıthane',url:'https://www.kent.edu.tr/sanal-tur/kagithane/'},{label:'Taksim',url:'https://www.kent.edu.tr/sanal-tur/taksim/'}]},
};

export function UniversityTour({lang,slug,name}:{lang:Language;slug:string;name:string}){
  const tour=tours[slug];
  const [active,setActive]=useState(false),[scene,setScene]=useState(0),[fullscreenError,setFullscreenError]=useState(false);
  const frame=useRef<HTMLDivElement>(null);
  const visual=universityVisuals[slug as keyof typeof universityVisuals];
  const title=T('گردش مجازی در دانشگاه','Explore the campus virtually','Kampüsü sanal olarak keşfedin')[lang];
  return <section className="intl-campus-tour" aria-label={title}>
    <div className="intl-tour-heading"><div><span className="intl-tour-tag"><Rotate3D size={18}/> {tour?'360°':T('بازدید از پردیس','Campus visit','Kampüs ziyareti')[lang]}</span><h2>{title}</h2></div>{tour&&<a href={tour.source} target="_blank" rel="noopener noreferrer">{T('منبع رسمی دانشگاه','Official university source','Resmî üniversite kaynağı')[lang]} <ExternalLink size={16}/></a>}</div>
    {tour ? <>
      <p>{T('با ماوس یا لمس صفحه اطراف را ببینید و از نقاط داخل تور بین فضاها حرکت کنید. حالت هدست VR به امکانات تور دانشگاه و مرورگر شما بستگی دارد.','Look around with your mouse or touch screen, and follow the tour hotspots to move between spaces. Headset VR depends on the university’s viewer and your browser.','Fare veya dokunmatik ekranla etrafa bakın; alanlar arasında turdaki bağlantılarla ilerleyin. VR başlık desteği üniversitenin görüntüleyicisine ve tarayıcınıza bağlıdır.')[lang]}</p>
      <div className="intl-tour-controls">{tour.scenes.length>1&&<label>{T('پردیس','Campus','Kampüs')[lang]} <select value={scene} onChange={e=>{setScene(Number(e.target.value));setActive(false);}}>{tour.scenes.map((s,i)=><option value={i} key={s.url}>{s.label}</option>)}</select></label>}<a href={tour.scenes[scene].url} target="_blank" rel="noopener noreferrer">{T('باز کردن تور در صفحهٔ مستقل','Open tour in a separate page','Turu ayrı sayfada aç')[lang]} <ExternalLink size={16}/></a>{active&&<button type="button" onClick={async()=>{try{await frame.current?.requestFullscreen();}catch{setFullscreenError(true);}}}><Maximize size={16}/>{T('تمام‌صفحه','Full screen','Tam ekran')[lang]}</button>}</div>
      <div className="intl-tour-viewer" ref={frame}>{active?<iframe key={tour.scenes[scene].url} src={tour.scenes[scene].url} title={`${name} — ${tour.scenes[scene].label} — 360°`} allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<div className="intl-tour-poster"><img src={visual.image} alt="" loading="lazy" width={1400} height={900}/><div><button className="intl-tour-start" type="button" onClick={()=>setActive(true)}><Rotate3D size={26}/>{T('شروع تور ۳۶۰ درجه','Start the 360° tour','360° turu başlat')[lang]}</button><small>{T('با شروع، تور از وب‌سایت دانشگاه بارگذاری می‌شود.','Starting loads content from the university’s website.','Başlatınca üniversitenin web sitesindeki içerik yüklenir.')[lang]}</small></div></div>}</div>
      <p className="intl-tour-help" role={fullscreenError?'status':undefined}>{fullscreenError?T('تمام‌صفحه در این مرورگر در دسترس نیست؛ تور را در صفحهٔ مستقل باز کنید.','Full screen is unavailable in this browser; open the tour in a separate page.','Bu tarayıcıda tam ekran kullanılamıyor; turu ayrı sayfada açın.')[lang]:T('اگر تور داخل صفحه باز نشد، از لینک صفحهٔ مستقل استفاده کنید.','If the embedded tour does not load, use the separate-page link.','Gömülü tur açılmazsa ayrı sayfa bağlantısını kullanın.')[lang]}</p>
    </>:<div className="intl-tour-unavailable"><p>{T('هنوز تور عمومی و قابل‌تأیید ۳۶۰ درجه برای این دانشگاه پیدا نشده است. برای آشنایی با پردیس، اطلاعات رسمی دانشگاه را ببینید.','A verified public 360° tour has not yet been found for this university. Explore the university’s official campus information.','Bu üniversite için henüz doğrulanmış, herkese açık bir 360° tur bulunamadı. Üniversitenin resmî kampüs bilgilerini inceleyin.')[lang]}</p><a href={visual.website} target="_blank" rel="noopener noreferrer">{T('وب‌سایت رسمی دانشگاه','Official university website','Üniversitenin resmî web sitesi')[lang]} <ExternalLink size={16}/></a></div>}
  </section>;
}
