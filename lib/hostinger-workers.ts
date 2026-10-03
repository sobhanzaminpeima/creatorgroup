/** Node adapter used only by the Hostinger webpack build. Sites retains D1/R2. */
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync,chmodSync} from 'node:fs';
import {writeFile,unlink,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
let database:DatabaseSync|undefined;
function db(){
 if(database)return database;
 const root=resolve(process.env.CREATOR_DATA_DIR||'./data');
 mkdirSync(root,{recursive:true,mode:0o700});
 const connection=new DatabaseSync(resolve(root,'creator-group.sqlite'));
 try{
  connection.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS _creator_migrations (name TEXT PRIMARY KEY)');
  const migrations=resolve(process.cwd(),'drizzle');
  for(const file of readdirSync(migrations).filter(f=>f.endsWith('.sql')).sort()){
   if(connection.prepare('SELECT name FROM _creator_migrations WHERE name=?').get(file))continue;
   connection.exec('BEGIN IMMEDIATE');
   try{
    // Another server worker may have applied this migration while we waited.
    if(!connection.prepare('SELECT name FROM _creator_migrations WHERE name=?').get(file)){
     connection.exec(readFileSync(resolve(migrations,file),'utf8'));
     connection.prepare('INSERT INTO _creator_migrations (name) VALUES (?)').run(file);
    }
    connection.exec('COMMIT');
   }catch(error){connection.exec('ROLLBACK');throw error;}
  }
  chmodSync(resolve(root,'creator-group.sqlite'),0o600);
  database=connection;
  return database;
 }catch(error){connection.close();throw error;}
}
class Statement{constructor(private sql:string,private params:(string|number|null)[]=[]){ }bind(...params:(string|number|null)[]){return new Statement(this.sql,params)}async first<T>(){return(db().prepare(this.sql).get(...this.params)||null) as T|null}async run(){const r=db().prepare(this.sql).run(...this.params);return{success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}}}}
function filePath(key:string){if(!/^medical\/[a-f0-9-]+\/[a-f0-9-]+\.(pdf|png|jpg)$/.test(key))throw Error('Invalid private file key');return resolve(process.env.CREATOR_DATA_DIR||'./data','private-files',key)}
export const env={DB:{prepare:(sql:string)=>new Statement(sql)},FILES:{async put(key:string,value:Uint8Array){const path=filePath(key);await mkdir(dirname(path),{recursive:true,mode:0o700});await writeFile(path,value,{mode:0o600});return{}},async delete(key:string){try{await unlink(filePath(key))}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}}}};
