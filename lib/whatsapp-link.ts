export const leadWhatsAppNumber='905313626988';
export function leadWhatsAppLink(lead:{code:string;name:string;phone:string;email:string;service:string}){
 // Only contact details and a reference; never include the private tracking key or medical documents.
 const text=`Creator Group — New inquiry\nReference: ${lead.code}\nName: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email}\nService: ${lead.service}`;
 return `https://wa.me/${leadWhatsAppNumber}?text=${encodeURIComponent(text)}`;
}
