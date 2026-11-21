import {readFileSync,realpathSync} from "node:fs";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
import {projectProfile} from "./project-profile.mjs";

const options={},args=process.argv.slice(2);
for(let i=0;i<args.length;i++) {
  if(args[i]==='--list') options.list=true;
  else if(['--query','--item','--project','--profile'].includes(args[i]) && args[i+1] && !args[i+1].startsWith('--')) options[args[i].slice(2)]=args[++i];
  else throw Error("Unknown or incomplete discovery option: "+args[i]);
}
const root=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const manifest=JSON.parse(readFileSync(join(root,'rams.json'),'utf8'));
const bytes=readFileSync(join(root,'agent-index.json'));
const hash=x=>createHash('sha256').update(x).digest('hex');
if(hash(bytes)!==manifest.files['agent-index.json']?.sha256) throw Error("Agent index hash differs from the source manifest.");
const index=JSON.parse(bytes);
if(index.format!=="rams-agent-index" || index.schemaVersion!==1 || index.version!==manifest.version || index.manifestItemsHash!==hash(JSON.stringify(manifest.items))) throw Error("Agent index does not match this source manifest.");
if((options.profile && !options.project) || (options.project && !options.profile)) throw Error("Use --project and --profile together; profiles are never inferred.");
const sharedRules=["AGENTS.md","docs/foundations.md"];
const profile=options.profile ? projectProfile(root,options.project,options.profile) : {kind:"default",inferred:false,fontProfile:"Geist",rules:sharedRules,stylesheets:["styles.css"],optionalPalette:"palette.css"};
const verify=file=>{if(hash(readFileSync(join(root,file)))!==manifest.files[file]?.sha256)throw Error("Selected source or guide hash differs: "+file);};
for(const file of [...sharedRules,"docs/profiles.md"])verify(file);
let result={format:"rams-discovery-result",schemaVersion:1,version:manifest.version,sharedRules,profile};
if(options.item) {
  const entry=index.items.find(x=>x.id===options.item);
  if(!entry) throw Error("Unknown item ID: "+options.item);
  for(const file of new Set([...entry.files,entry.guide]))verify(file);
  result={...result,item:entry,packages:manifest.items[entry.id].packages,requirements:manifest.requirements};
} else if(options.query || options.list) {
  const words=[...new Set((options.query||'').toLowerCase().split(/[\s,.;:?!]+/).filter(word=>word && !['a','an','the','for','to','with','and','or'].includes(word)))];
  const matches=index.items.map(entry=>{
    const direct=`${entry.id} ${entry.title} ${(entry.tags||[]).join(' ')} ${[...entry.exports.values,...entry.exports.types,...entry.exports.reexports.map(e=>e.name),entry.exports.default??''].join(' ')}`.toLowerCase();
    const heading=entry.guideTitle.toLowerCase(),matchedTerms=words.filter(word=>direct.includes(word)||heading.includes(word));
    return {...entry,matchedTerms,score:words.reduce((n,word)=>n+(direct.includes(word)?5:heading.includes(word)?1:0),0)};
  }).filter(entry=>!words.length || entry.matchedTerms.length).sort((a,b)=>b.matchedTerms.length-a.matchedTerms.length || b.score-a.score || a.id.localeCompare(b.id));
  result={...result,queryMode:'ranked-keywords',total:matches.length,items:(options.list?matches:matches.slice(0,10)).map(({id,title,kind,guide,matchedTerms})=>({id,title,kind,guide,matchedTerms,completeMatch:matchedTerms.length===words.length})),truncated:!options.list && matches.length>10};
} else result={...result,count:index.items.length,usage:["node tools/discover.mjs --query 'date range'","node tools/discover.mjs --item motion-date-range-picker","node tools/install.mjs --target <app> --items <IDs> --dry-run"],entry:"llms.txt",index:"agent-index.json"};
console.log(JSON.stringify(result,null,2));
