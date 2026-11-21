import { Folio21PublicHeaderDemo } from "./original-motion-print-navigation";
export default Folio21PublicHeaderDemo;
// A document-fixed header needs its own viewport; ordinary controls stay inline.
export function PublicHeaderFrame(){return <div style={{display:"grid",gap:"var(--rams-detail-preview-scene-gap)",inlineSize:"100%",minInlineSize:0}}><a style={{justifySelf:"end",fontSize:"var(--type-caption-size)",textDecoration:"underline"}} href="#/review/public-header" target="_blank" rel="noreferrer">Open full viewport</a><iframe title="Folio21 header with glass on scroll" src="#/review/public-header" style={{inlineSize:"100%",blockSize:"var(--rams-detail-docs-preview-isolated-block-size)",border:0}}/></div>}
