import ts from "typescript";
import {readFileSync,writeFileSync,lstatSync,realpathSync} from "node:fs";
import {join,resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";

export function compileAgentIndex(items, version, readSource) {
  const entries=[];
  for(const [id,item] of Object.entries(items)) {
    const candidates=[`components/${id}.tsx`,`components/${id}.ts`,`examples/${id}.tsx`];
    const file=candidates.find(p=>item.files.includes(p)) ?? item.files.find(p=>/\.[cm]?tsx?$/.test(p));
    if(!file) throw Error("No source declaration file for "+id);
    const text=readSource(file);
    const ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);
    const exports={values:[],types:[],reexports:[],default:null}, declarations=[];
    for(const node of ast.statements) {
      if(ts.isExportAssignment(node) && !node.isExportEquals) {exports.default=node.expression.getText(ast);continue;}
      if(ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
        for(const name of node.exportClause.elements) exports.reexports.push({name:name.name.text,typeOnly:!!(node.isTypeOnly || name.isTypeOnly),from:node.moduleSpecifier?.text ?? null});
      }
      const exported=node.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword);
      if(!exported) continue;
      if(node.modifiers?.some(m=>m.kind===ts.SyntaxKind.DefaultKeyword)) {exports.default=node.name?.text ?? 'default';continue;}
      if(ts.isVariableStatement(node)) {
        for(const n of node.declarationList.declarations) if(ts.isIdentifier(n.name)) exports.values.push(n.name.text);
      } else if(node.name && ts.isIdentifier(node.name)) {
        (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) ? exports.types : exports.values).push(node.name.text);
      }
      if(ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        declarations.push({name:node.name.text,line:ast.getLineAndCharacterOfPosition(node.getStart()).line+1,declaration:node.getText(ast)});
      }
    }
    if(!item.documentation) throw Error("Missing attached guide for "+id);
    const heading=readSource(item.documentation).match(/^# (.+)$/m)?.[1] ?? id;
    entries.push({id,kind:file.startsWith('examples/')?'example':id.startsWith('use-')?'hook':'component',title:id.replace(/^motion-/,'').split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join(' '),tags:item.tags??[],guide:item.documentation,guideTitle:heading,source:file,exports,declarations,apiScope:"Explicit local value/type declarations; inspect source for inherited, inferred and re-exported props.",files:item.files});
  }
  return {format:"rams-agent-index",schemaVersion:1,version,manifestItemsHash:createHash('sha256').update(JSON.stringify(items)).digest('hex'),entry:"llms.txt",rules:"AGENTS.md",foundations:"docs/foundations.md",profiles:"docs/profiles.md",items:entries};
}

export function generateAgentIndex(stage, items, version, knownFiles) {
  const checked=path=>{
    if(typeof path!=="string" || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(path) || path.split('/').some(p=>!p || p==='.' || p==='..' || p.startsWith('.')) || (knownFiles && !Object.hasOwn(knownFiles,path))) throw Error("Source or guide is outside the declared file set: "+path);
    let current=stage;
    for(const part of path.split('/')) {current=join(current,part);if(lstatSync(current).isSymbolicLink())throw Error("Source index excludes symlinks: "+path);}
    if(!lstatSync(current).isFile())throw Error("Expected source or guide file: "+path);
    return current;
  };
  for(const item of Object.values(items)) {
    for(const path of item.files)checked(path);
    checked(item.documentation);
  }
  const index=compileAgentIndex(items,version,path=>readFileSync(checked(path),'utf8'));
  writeFileSync(join(stage,'agent-index.json'),JSON.stringify(index,null,2)+'\n');
  return index;
}

// Explicit publisher/fork authoring only; discovery and installation never rehash
// changed files automatically. The manifest still declares the allowed file set.
if(process.argv[1] && realpathSync(resolve(process.argv[1]))===fileURLToPath(import.meta.url)) {
  if(process.argv.length!==3 || process.argv[2]!=="--write") throw Error("Usage: node tools/build-index.mjs --write (review source changes first)");
  const root=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),".."));
  const manifestPath=join(root,'rams.json'),manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
  if(manifest.format!=="rams-source-manifest" || manifest.schemaVersion!==1) throw Error("Unsupported source manifest");
  for(const file of Object.keys(manifest.files)) {
    if(file.startsWith('/') || file.includes('\\') || file.split('/').some(p=>!p || p==='.' || p==='..' || (p.startsWith('.') && file!=='.gitignore'))) throw Error("Unsafe manifest path: "+file);
    let current=root;
    for(const part of file.split('/')) {current=join(current,part);if(lstatSync(current).isSymbolicLink())throw Error("Source manifest excludes symlinks: "+file);}
    if(!lstatSync(current).isFile()) throw Error("Expected source file: "+file);
  }
  manifest.version=JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version;
  generateAgentIndex(root,manifest.items,manifest.version,manifest.files);
  for(const file of Object.keys(manifest.files)) { const bytes=readFileSync(join(root,file));manifest.files[file]={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}; }
  writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({status:"index-and-manifest-refreshed",version:manifest.version,items:Object.keys(manifest.items).length}));
}
