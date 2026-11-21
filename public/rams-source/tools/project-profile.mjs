import {readFileSync,realpathSync,statSync} from "node:fs";
import {resolve,dirname,relative,isAbsolute,sep,extname} from "node:path";

function contained(root,path) { const p=relative(root,path);return p!==".." && !p.startsWith(".."+sep) && !isAbsolute(p); }
const profileLists = { rules: [".md", ".txt"], stylesheets: [".css"] };
export function validateProjectProfileDescriptor(profile) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile) ||
      profile.schemaVersion !== 1 || profile.kind !== "project" ||
      Object.keys(profile).some(key => !["schemaVersion", "kind", ...Object.keys(profileLists)].includes(key))) {
    throw Error("Unsupported project profile schema.");
  }
  for (const key of Object.keys(profileLists)) {
    if (!Array.isArray(profile[key]) || !profile[key].length || profile[key].length > 16)
      throw Error("Profile needs a nonempty " + key + " list.");
    if (profile[key].some(value => typeof value !== "string" || /\0|^[a-z]+:/i.test(value)))
      throw Error("Profile entries must be local file paths.");
  }
  return profile;
}
export function projectProfile(packageRoot, projectPath, profilePath) {
  if(!projectPath || !profilePath) throw Error("A private profile requires explicit --project and --profile paths.");
  const project=realpathSync(resolve(projectPath)), file=realpathSync(resolve(project,profilePath));
  if(!contained(project,file) || contained(packageRoot,file)) throw Error("Profile must be inside the selected project and outside the source package.");
  let profile;
  try {profile=JSON.parse(readFileSync(file,'utf8'));} catch {throw Error("Project profile must contain valid JSON.");}
  validateProjectProfileDescriptor(profile);
  const output={kind:"project",inferred:false,file,rules:[],stylesheets:[]};
  for(const [key,extensions] of Object.entries(profileLists)) {
    for(const value of profile[key]) {
      const path=realpathSync(resolve(dirname(file),value));
      if(!contained(project,path) || contained(packageRoot,path) || !statSync(path).isFile() || !extensions.includes(extname(path).toLowerCase())) throw Error("Profile entry must be an allowed file inside the selected project, outside the source package.");
      output[key].push(path);
    }
  }
  return output;
}
