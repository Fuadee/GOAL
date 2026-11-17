// Isolated loopback-only REST fixture for browser verification. Never connects to Supabase.
const http = require('node:http');
const { referenceHistory, uuid, createLoader } = require('./helpers.cjs');
const { RUNNING_LEVELS } = createLoader()('lib/running/achievements.ts');
let rows = structuredClone(referenceHistory);
const revisions = [];
let sequence=2000; let failReads=false;let failWrites=false;let delay=0;
const levels=RUNNING_LEVELS.map((level,index)=>({...level,id:uuid(101+index)}));
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 const json=(value,status=200)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(value));};
 let body='';for await(const chunk of req)body+=chunk;
 const input=body?JSON.parse(body):{};
 if(url.pathname==='/__test/state')return json({rows,revisions});
 if(url.pathname==='/__test/reset'&&req.method==='POST'){rows=input.empty?[]:structuredClone(referenceHistory);revisions.length=0;failReads=false;failWrites=false;delay=0;return json({ok:true});}
 if(url.pathname==='/__test/options'&&req.method==='POST'){failReads=!!input.failReads;failWrites=!!input.failWrites;delay=input.delay||0;return json({ok:true});}
 if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
 if(failReads&&req.method==='GET')return json({message:'Simulated database unavailable'},503);
 if(failWrites&&req.method!=='GET')return json({message:'Simulated write failure'},503);
 const table=url.pathname.replace('/rest/v1/','');const query=url.searchParams;
 if(table==='runner_levels')return json(levels);
 if(table==='runner_level_progress'||table==='runner_rest_days'||table==='goal_vision_images')return json([]);
 if(table!=='runner_run_logs')return json([]);
 if(req.method==='GET'){
   const sorted=[...rows].sort((a,b)=>b.run_date.localeCompare(a.run_date)||b.created_at.localeCompare(a.created_at)||b.id.localeCompare(a.id));
   const offset=Number(query.get('offset')||0),limit=Number(query.get('limit')||500);
   return json(sorted.slice(offset,offset+limit));
 }
 if(req.method==='POST'){
   const timestamp=new Date().toISOString();const row={id:uuid(sequence++),created_at:timestamp,updated_at:timestamp,deleted_at:null,...input};rows.push(row);return json([row],201);
 }
 if(req.method==='PATCH'){
   const row=rows.find(row=>`eq.${row.id}`===query.get('id') && `eq.${row.updated_at}`===query.get('updated_at') && !row.deleted_at);
   if(!row)return json([]);
   revisions.push(structuredClone(row));Object.assign(row,input,{updated_at:new Date().toISOString()});return json([row]);
 }
 return json({message:'Unsupported test operation'},405);
});
server.listen(54125,'127.0.0.1',()=>console.log('Health test REST fixture: http://127.0.0.1:54125 (memory only)'));
