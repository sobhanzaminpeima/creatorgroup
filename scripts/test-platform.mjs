import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
const dir=await mkdtemp(join(tmpdir(),'creator-platform-test-')),password=randomBytes(32).toString('hex'),port='5197';
const env={...process.env,CREATOR_HOSTINGER:'1',CREATOR_DATA_DIR:dir,CREATOR_ADMIN_PASSWORD:password,PLATFORM_TEST_ADMIN_PASSWORD:password,PLATFORM_TEST_BASE_URL:`http://127.0.0.1:${port}`};
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',port],{env,stdio:['ignore','pipe','pipe']});
try{await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Test server did not start')),15000);server.stdout.on('data',b=>{if(b.toString().includes('Ready')){clearTimeout(timer);resolve();}});server.on('error',reject);server.on('exit',c=>{if(c)reject(Error('Test server failed'));});});const tests=spawn('python3',['tests/platform-api.py'],{env,stdio:'inherit'});process.exitCode=await new Promise(resolve=>tests.on('exit',c=>resolve(c||0)));}finally{server.kill('SIGTERM');await new Promise(resolve=>server.once('exit',resolve));await rm(dir,{recursive:true,force:true});}
