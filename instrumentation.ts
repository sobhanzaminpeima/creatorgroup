export async function register(){
 if(process.env.NEXT_RUNTIME==='nodejs'){
  const {startEmailRetries}=await import('./lib/email-retry');startEmailRetries();
 }
}
