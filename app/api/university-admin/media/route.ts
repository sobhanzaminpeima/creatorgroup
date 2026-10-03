import {upload} from '@/lib/university-media';
export const POST=(r:Request)=>upload(r,true);
