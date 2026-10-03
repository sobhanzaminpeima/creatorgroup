import {listCountries} from '@/lib/country-store';
export const dynamic='force-dynamic';
export async function GET(){return Response.json({countries:await listCountries()},{headers:{'Cache-Control':'public, max-age=60'}});}
