import {readMedia} from '@/lib/university-media';
export async function GET(r:Request,{params}:{params:Promise<{id:string}>}){return readMedia(r,(await params).id);}
