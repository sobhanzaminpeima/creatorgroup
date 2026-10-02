'use client';
export default function Error({reset}:{reset:()=>void}){return <main style={{minHeight:'100vh',background:'#edf4f5',color:'#17354a',padding:'12vh 8%'}}><h1>Something went wrong · خطا در بارگذاری · Bir hata oluştu</h1><button onClick={reset} style={{padding:18,background:'#117b85',color:'white',borderRadius:8,marginTop:30}}>Try again / تلاش مجدد / Yeniden dene</button></main>}
