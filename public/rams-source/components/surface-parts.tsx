"use client";
import*as React from'react';
import{cx}from'./utils';
export function surfaceDiv(slot:string,className:string){
 return React.forwardRef<HTMLDivElement,React.ComponentPropsWithoutRef<'div'>>(function SurfacePart({className:extra,...props},ref){return <div {...props} ref={ref} className={cx(className,extra)} data-rams-primitive="true" data-slot={slot}/>;});
}
export function CloseGlyph(){return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" style={{strokeWidth:"var(--rams-detail-surface-close-glyph-stroke)"}} strokeLinecap="round"/></svg>;}
export function surfaceChildren(children:React.ReactNode,close:React.ReactNode,asChild:boolean){
 if(!asChild)return <>{children}{close}</>;
 const child=React.Children.only(children) as React.ReactElement<{children?:React.ReactNode}>;
 return React.cloneElement(child,undefined,child.props.children,close);
}
