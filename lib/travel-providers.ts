/** Live bookings are never inferred from catalogue content or assistance requests. */
export interface ProviderResult<T>{available:boolean;items:T[];reason?:string;}
export interface HotelProvider {searchHotels(input:Record<string,string>):Promise<ProviderResult<unknown>>;getHotelDetails(id:string):Promise<unknown>;checkAvailability(id:string):Promise<boolean>;getPrice(id:string):Promise<unknown>;createBooking(input:unknown):Promise<unknown>;getBookingStatus(id:string):Promise<unknown>;}
export interface FlightProvider {searchFlights(input:Record<string,string>):Promise<ProviderResult<unknown>>;getFlightDetails(id:string):Promise<unknown>;checkAvailability(id:string):Promise<boolean>;getFareRules(id:string):Promise<unknown>;createBooking(input:unknown):Promise<unknown>;getBookingStatus(id:string):Promise<unknown>;}
export interface RoutingProvider {route(from:{lat:number;lng:number},to:{lat:number;lng:number},mode:'walking'|'driving'|'transit'):Promise<{distanceKm:number;durationMinutes:number;source:string}>;}
export const hotelProvider:HotelProvider|null=null;
export const flightProvider:FlightProvider|null=null;
export const routingProvider:RoutingProvider|null=null;
export function straightLineDistance(a:{lat:number;lng:number},b:{lat:number;lng:number}){const rad=(n:number)=>n*Math.PI/180;const dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng);return Math.round(6371*2*Math.atan2(Math.sqrt(Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2),Math.sqrt(1-(Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2)))*10)/10;}
