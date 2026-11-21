// Installed tooling: resolve paths from this file, never the caller's cwd.
import {readFileSync,writeFileSync} from 'node:fs';
import {compilePageHeaderStyles} from './page-header-styles.mjs';
const template=new URL('../components/motion-page-header.module.css.in',import.meta.url);
const authority=new URL('./page-header-authority.json',import.meta.url);
const output=new URL('../components/motion-page-header.module.css',import.meta.url);
const compiled=compilePageHeaderStyles(readFileSync(template,'utf8'),JSON.parse(readFileSync(authority,'utf8')));
if(process.argv.includes('--check')) {if(readFileSync(output,'utf8')!==compiled) throw Error('PageHeader installed CSS differs from source authority');}
else writeFileSync(output,compiled);
