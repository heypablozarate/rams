"use client";
import*as React from'react';
import{Dialog as R}from'radix-ui';
import{useComposedRefs}from'@radix-ui/react-compose-refs';
import{cx}from'./utils';
import{surfaceDiv,surfaceChildren}from'./surface-parts';
import{DialogCloseButton}from'./dialog';
import'./primitives.css';
import'./surfaces.css';
import'./sheets.css';
export const Sheet=R.Root,SheetTrigger=R.Trigger,SheetClose=R.Close,SheetPortal=R.Portal;
export const SheetOverlay=React.forwardRef<React.ElementRef<typeof R.Overlay>,React.ComponentPropsWithoutRef<typeof R.Overlay>>(function SheetOverlay({className,...props},ref){return <R.Overlay {...props} ref={ref} className={cx('rams-surface__overlay','rams-sheet__overlay',className)} data-slot="sheet-overlay"/>;});
export type SheetContentProps=React.ComponentPropsWithoutRef<typeof R.Content>&{side?:'top'|'right'|'bottom'|'left';showCloseButton?:boolean};
// Hosting-only opt-in for the two pinned upstream Sheet examples. Tag/style
// matching is not provenance: ordinary consumers never enter this adapter.
const LegacySheetBodyInset=React.createContext(false);
export function SheetLegacyBodyInsetBoundary({children}:{children:React.ReactNode}){
 return <LegacySheetBodyInset.Provider value={true}>{children}</LegacySheetBodyInset.Provider>;
}
// The literal identifies the upstream inset, not a design authority. The shared
// surface owns that inset; adapted bodies consume its zero-inset token.
const legacyBodyInset="min(1.5rem,5vw)";
const catalogBodyInset="var(--rams-detail-preview-detail-inset)";
function adaptLegacySheetBodyInset(children:React.ReactNode):React.ReactNode{
 function adapt(child:React.ReactNode):React.ReactNode{
  if(!React.isValidElement<{style?:React.CSSProperties;children?:React.ReactNode;'data-rams-sheet-body-inset'?:string}>(child))return child;
  if(child.type===React.Fragment)return React.cloneElement(child,undefined,adaptLegacySheetBodyInset(child.props.children));
  if(child.type!=='form'&&child.type!=='p')return child;
  const paddingInline=child.props.style?.paddingInline;
  if(paddingInline!==legacyBodyInset&&paddingInline!==catalogBodyInset)return child;
  return React.cloneElement(child,{style:{...child.props.style,paddingInline:'var(--rams-detail-space-0)'},'data-rams-sheet-body-inset':'surface'});
 }
 // Avoid Children.map for a single element: asChild delegates that element,
 // including its key and ref, rather than an array containing it.
 return React.isValidElement(children)?adapt(children):React.Children.map(children,adapt);
}
function adaptLegacySheetContent(children:React.ReactNode,asChild:boolean){
 if(!asChild)return adaptLegacySheetBodyInset(children);
 const child=React.Children.only(children) as React.ReactElement<{children?:React.ReactNode}>;
 // The delegated element is the surface, never a body. Only intrinsic surfaces
 // and transparent fragments expose body children; custom components own theirs.
 if(typeof child.type!=='string'&&child.type!==React.Fragment)return child;
 return React.cloneElement(child,undefined,adaptLegacySheetBodyInset(child.props.children));
}
export const SheetContent=React.forwardRef<React.ElementRef<typeof R.Content>,SheetContentProps>(function SheetContent({asChild=false,side='right',showCloseButton=true,className,children,forceMount,onOpenAutoFocus,...props},ref){
 const content=React.useRef<HTMLDivElement>(null),composedRef=useComposedRefs(content,ref);
 const legacyBodyInsetEnabled=React.useContext(LegacySheetBodyInset);
 const contentChildren=legacyBodyInsetEnabled?adaptLegacySheetContent(children,asChild):children;
 return <SheetPortal forceMount={forceMount}><SheetOverlay forceMount={forceMount}/><R.Content tabIndex={-1} {...props} asChild={asChild} forceMount={forceMount} ref={composedRef} onOpenAutoFocus={event=>{onOpenAutoFocus?.(event);if(!event.defaultPrevented){event.preventDefault();content.current?.focus({preventScroll:true});}}} className={cx('rams-sheet__content',className)} data-side={side} data-rams-primitive="true" data-slot="sheet-content" data-has-close={showCloseButton||undefined}>{surfaceChildren(contentChildren,showCloseButton&&<DialogCloseButton/>,asChild)}</R.Content></SheetPortal>;
});
export const SheetHeader=surfaceDiv('sheet-header','rams-surface__header rams-surface__header-gap rams-sheet__header');
export const SheetFooter=surfaceDiv('sheet-footer','rams-surface__footer rams-sheet__footer');
export const SheetTitle=React.forwardRef<React.ElementRef<typeof R.Title>,React.ComponentPropsWithoutRef<typeof R.Title>>(function SheetTitle({className,...props},ref){return <R.Title {...props} ref={ref} className={cx('rams-surface__title',className)} data-rams-primitive="true" data-slot="sheet-title"/>;});
export const SheetDescription=React.forwardRef<React.ElementRef<typeof R.Description>,React.ComponentPropsWithoutRef<typeof R.Description>>(function SheetDescription({className,...props},ref){return <R.Description {...props} ref={ref} className={cx('rams-surface__description',className)} data-rams-primitive="true" data-slot="sheet-description"/>;});

export const SheetBody=surfaceDiv('sheet-body','rams-surface__body');
