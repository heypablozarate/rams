"use client";
import { useId, useState } from "react";
import type { CSSProperties } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { SiteHeaderBlock } from "@/variants/vendor/registry/blocks/site-header/site-header";
import { PublicHeader } from "@/variants/materials/public-header/public-header";
import { SiteFooter } from "@/variants/vendor/registry/blocks/site-footer/site-footer";
import type { SiteFooterVariant } from "@/variants/vendor/registry/blocks/site-footer/site-footer";
const sceneStyle: CSSProperties = { display:"grid", gridTemplateColumns:"minmax(0,1fr)", inlineSize:"100%", gap:"var(--rams-detail-space-4, calc(var(--rams-detail-preview-space-step-fallback) * 4))", color:"var(--rams-detail-foreground,currentColor)", lineHeight:"var(--type-body-leading, var(--rams-detail-preview-print-scene-leading))" };
const noteStyle: CSSProperties = { margin:0, color:"var(--rams-detail-text-secondary,currentColor)", fontSize:"var(--rams-detail-text-sm, var(--rams-detail-preview-print-scene-caption-size-fallback))", overflowWrap:"anywhere" };
export function PrintArchiveSiteHeaderDemo() { return <section style={sceneStyle} aria-label="Folio21 archive header"><SiteHeaderBlock /></section>; }
const publicNavItems = [{href:"/issues",label:"Issues"},{href:"/plates",label:"Plates"},{href:"/paper",label:"Paper"},{href:"/colophon",label:"Colophon"}];
const publicPages: Record<string,{title:string;detail:string}> = {
  "/": {title:"Folio21",detail:"Buenos Aires · 140 sample copies · 24 text pages."},
  "/issues": {title:"Issue index",detail:"24 text pages, folded as three eight-page signatures, with a separate cover."},
  "/plates": {title:"Plate notes",detail:"Oxide red carries the cover rule; black carries type and page furniture."},
  "/paper": {title:"Paper study",detail:"100 gsm uncoated text stock with a 220 gsm cover."},
  "/colophon": {title:"Colophon",detail:"Folio21 · Buenos Aires · 140 sample copies; 24 pages in three signatures."},
};
const publicHeaderCopy = {primaryNavigationLabel:"Print archive",mobileNavigationLabel:"Mobile print archive",openNavigationLabel:"Open navigation",closeNavigationLabel:"Close navigation",menuLabel:"Menu"};
/** Full-document scene: the catalog hosts this fixed header in its own viewport. */
export function Folio21PublicHeaderDemo() {
  const [path,setPath]=useState("/");
  const page=publicPages[path] ?? publicPages["/"]!;
  return <div className="rams-public-glass-scope" style={{...sceneStyle,minHeight:"var(--rams-detail-public-header-preview-document-min-height)",background:"var(--rams-detail-background)",gap:0}} onClick={event=>{
    const anchor=(event.target as Element).closest<HTMLAnchorElement>(".rams-public-header a");
    if(anchor){event.preventDefault();const href=anchor.getAttribute("href")||"/";if(href in publicPages)setPath(href);}
  }}>
    <PublicHeader currentPath={path} navItems={publicNavItems} wordmark={<span style={{fontSize:"var(--rams-detail-text-lg, var(--rams-detail-preview-print-scene-title-size-fallback))",fontWeight:"var(--rams-detail-public-header-preview-wordmark-weight)",whiteSpace:"nowrap"}}>Folio21</span>} copy={publicHeaderCopy}/>
    <div style={{paddingBlockStart:"var(--rams-detail-public-header-bar-block-size)"}}>
      <section aria-live="polite" style={{display:"grid",alignContent:"center",minHeight:"var(--rams-detail-public-header-preview-opening-min-height)",paddingBlock:"var(--rams-detail-public-header-preview-section-block-inset)",boxSizing:"border-box"}}>
        <div className="rams-public-page-inner" style={{display:"grid",gap:"var(--rams-detail-public-header-preview-section-gap)"}}>
        <p style={noteStyle}>Folio21 · Buenos Aires</p>
        <h1 style={{margin:0,fontSize:"var(--rams-detail-public-header-preview-title-size)",fontWeight:"var(--rams-detail-label-weight)",lineHeight:"var(--rams-detail-public-header-preview-title-leading)",letterSpacing:"var(--rams-detail-public-header-preview-title-tracking)",overflowWrap:"anywhere"}}>{page.title}</h1>
        <p style={{margin:0,maxInlineSize:"var(--rams-detail-public-header-preview-copy-measure)"}}>{page.detail}</p>
        </div>
      </section>
      <section style={{display:"grid",alignContent:"center",minHeight:"var(--rams-detail-public-header-preview-notes-min-height)",paddingBlock:"var(--rams-detail-public-header-preview-section-block-inset)",boxSizing:"border-box",background:"var(--rams-detail-surface-muted)"}}>
        <div className="rams-public-page-inner" style={{display:"grid",gap:"var(--rams-detail-public-header-preview-section-gap)"}}>
        <h2 style={{margin:0,fontSize:"var(--rams-detail-text-2xl, var(--rams-detail-preview-navigation-notes-heading-size-fallback))",lineHeight:"var(--rams-detail-public-header-preview-subheading-leading)"}}>Before trimming</h2>
        <ol style={{margin:0,paddingInlineStart:"var(--rams-detail-public-header-preview-list-indent)",display:"grid",gap:"var(--rams-detail-public-header-preview-list-gap)"}}><li>Fold one sheet and check the reader sequence.</li><li>Compare the oxide-red rule against the black type plate.</li><li>Keep the cover rule 5 mm inside the trim edge.</li></ol>
        </div>
      </section>
    </div>
  </div>;
}
const footerDestinations:Record<string,string>={
  Folio21:"Folio21 · Buenos Aires · sample edition.",
  "Sheet plan":"24 pages: three eight-page signatures.",
  "Paper notes":"100 gsm text stock with a 220 gsm cover.",
  "Cover rule":"Keep the oxide-red cover rule 5 mm inside trim.",
  "Issue index":"The Folio21 sample edition contains the sheet plan, paper notes, cover rule, and colophon.",
  Colophon:"140 sample copies; 24 pages in three signatures.",
  "Trim checklist":"Fold the proof, check page order, compare the plates, then trim.",
};
export function PrintArchiveSiteFooterDemo(){
  const id=useId();const[variant,setVariant]=useState<SiteFooterVariant>("columns");const[destination,setDestination]=useState<string|null>(null);const[addresses,setAddresses]=useState<string[]>([]);
  return <section style={sceneStyle} aria-label="Folio21 archive footer">
    <div style={{display:"grid",gap:"var(--rams-detail-site-footer-preview-picker-gap)",maxInlineSize:"var(--rams-detail-site-footer-preview-picker-measure)"}}><label htmlFor={id}>Footer layout</label><Select value={variant} onValueChange={v=>setVariant(v as SiteFooterVariant)}><SelectTrigger id={id}><SelectValue/></SelectTrigger><SelectContent><SelectItem value="columns">Link columns</SelectItem><SelectItem value="minimal">Minimal row</SelectItem><SelectItem value="logo">Closing wordmark</SelectItem></SelectContent></Select></div>
    <SiteFooter variant={variant} legal={[]} socials={[]} status={null} year={2026} onNavigate={link=>setDestination(footerDestinations[link.label]??null)} newsletter={{title:"Edition notes",description:"Keep this address in the local Folio21 list.",placeholder:"reader@folio21.example",onSubscribe:email=>setAddresses(current=>[...current,email])}}/>
    {destination&&<p role="status" style={noteStyle}>{destination}</p>}
    <p role="status" style={noteStyle}>{addresses.length===0?"No addresses in the local list.":`${addresses.length} ${addresses.length===1?"address":"addresses"} in the local list.`}</p>
    {addresses.length>0&&<ul style={{margin:0,paddingInlineStart:"var(--rams-detail-site-footer-preview-address-indent)",overflowWrap:"anywhere"}}>{addresses.map((email,i)=><li key={`${i}-${email}`}>{email}</li>)}</ul>}
  </section>;
}
