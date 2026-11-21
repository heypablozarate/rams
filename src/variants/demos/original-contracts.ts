import meta from './original-preview-meta.json' with{type:'json'};
import type{PreviewContract}from'../../catalog/preview-contracts';
export function getOriginalLibraryContract(id:string):PreviewContract|undefined{
 const entry=(meta as Record<string,{summary:string;limits:string[];checks:string[]}>)[id];
 return entry?{demonstrates:[entry.summary],limits:[...entry.limits],checks:[...entry.checks]}:undefined;
}
