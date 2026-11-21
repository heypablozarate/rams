"use client";
import*as React from'react';
import{Dialog as R}from'radix-ui';
import{Button}from'./button';
import{cx}from'./utils';
import{surfaceDiv,CloseGlyph,surfaceChildren}from'./surface-parts';
import'./primitives.css';
import'./surfaces.css';
export const Dialog=R.Root,DialogTrigger=R.Trigger,DialogClose=R.Close,DialogPortal=R.Portal;
export const DialogOverlay=React.forwardRef<React.ElementRef<typeof R.Overlay>,React.ComponentPropsWithoutRef<typeof R.Overlay>>(function DialogOverlay({className,...props},ref){return <R.Overlay {...props} ref={ref} className={cx('rams-surface__overlay',className)} data-slot="dialog-overlay"/>;});
export function DialogCloseButton(){return <DialogClose asChild><Button type="button" size="icon-sm" variant="ghost" className="rams-surface__close" aria-label="Close"><CloseGlyph/></Button></DialogClose>;}
export type DialogContentProps=React.ComponentPropsWithoutRef<typeof R.Content>&{showCloseButton?:boolean};
export const DialogContent=React.forwardRef<React.ElementRef<typeof R.Content>,DialogContentProps>(function DialogContent({asChild=false,className,children,showCloseButton=true,forceMount,...props},ref){return <DialogPortal forceMount={forceMount}><DialogOverlay forceMount={forceMount}/><R.Content {...props} asChild={asChild} forceMount={forceMount} ref={ref} className={cx('rams-dialog__content',className)} data-rams-primitive="true" data-slot="dialog-content" data-has-close={showCloseButton||undefined}>{surfaceChildren(children,showCloseButton&&<DialogCloseButton/>,asChild)}</R.Content></DialogPortal>;});
export const DialogHeader=surfaceDiv('dialog-header','rams-surface__header rams-surface__header-gap');
export const DialogFooter=surfaceDiv('dialog-footer','rams-surface__footer');
export const DialogTitle=React.forwardRef<React.ElementRef<typeof R.Title>,React.ComponentPropsWithoutRef<typeof R.Title>>(function DialogTitle({className,...props},ref){return <R.Title {...props} ref={ref} className={cx('rams-surface__title',className)} data-rams-primitive="true" data-slot="dialog-title"/>;});
export const DialogDescription=React.forwardRef<React.ElementRef<typeof R.Description>,React.ComponentPropsWithoutRef<typeof R.Description>>(function DialogDescription({className,...props},ref){return <R.Description {...props} ref={ref} className={cx('rams-surface__description',className)} data-rams-primitive="true" data-slot="dialog-description"/>;});

export const DialogBody=surfaceDiv('dialog-body','rams-surface__body');
