require('dotenv').config();
const fs=require('fs');
const path=require('path');
const db=require('../config/database');

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function waitForDatabase(){
  const attempts=Number(process.env.MIGRATION_DB_RETRIES||12);
  const delay=Number(process.env.MIGRATION_DB_RETRY_DELAY_MS||3000);
  let lastError;
  for(let attempt=1;attempt<=attempts;attempt++){
    try{ await db.query('SELECT 1'); return; }
    catch(error){ lastError=error; console.warn(`Database connection attempt ${attempt}/${attempts} failed: ${error.message}`); if(attempt<attempts) await sleep(delay); }
  }
  throw lastError;
}

async function main(){
  await waitForDatabase();
  const dir=path.resolve(__dirname,'../../../database/migrations');
  const files=fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).sort();
  await db.query('CREATE TABLE IF NOT EXISTS schema_migrations(version VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  for(const file of files){
    const exists=await db.query('SELECT 1 FROM schema_migrations WHERE version=$1',[file]);
    if(exists.rowCount){ console.log(`Skipping ${file}`); continue; }
    console.log(`Applying ${file}`);
    await db.query(fs.readFileSync(path.join(dir,file),'utf8'));
    await db.query('INSERT INTO schema_migrations(version) VALUES($1)',[file]);
  }
  console.log('Migrations complete');
  await db.close();
}
main().catch(async e=>{ console.error(e); await db.close(); process.exit(1); });
