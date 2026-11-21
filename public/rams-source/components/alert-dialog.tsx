"use client";
import*as React from'react';
import{AlertDialog as R}from'radix-ui';
import{Button}from'./button';
import{cx}from'./utils';
import{surfaceDiv}from'./surface-parts';
import'./primitives.css';
import'./surfaces.css';
export const AlertDialog=R.Root,AlertDialogTrigger=R.Trigger,AlertDialogPortal=R.Portal;
export const AlertDialogOverlay=React.forwardRef<React.ElementRef<typeof R.Overlay>,React.ComponentPropsWithoutRef<typeof R.Overlay>>(function AlertDialogOverlay({className,...props},ref){return <R.Overlay {...props} ref={ref} className={cx('rams-surface__overlay',className)} data-slot="alert-dialog-overlay"/>;});
export const AlertDialogContent=React.forwardRef<React.ElementRef<typeof R.Content>,React.ComponentPropsWithoutRef<typeof R.Content>>(function AlertDialogContent({className,forceMount,...props},ref){return <AlertDialogPortal forceMount={forceMount}><AlertDialogOverlay forceMount={forceMount}/><R.Content {...props} forceMount={forceMount} ref={ref} className={cx('rams-dialog__content',className)} data-rams-primitive="true" data-slot="alert-dialog-content"/></AlertDialogPortal>;});
export const AlertDialogHeader=surfaceDiv('alert-dialog-header','rams-surface__header rams-surface__header-gap');
export const AlertDialogFooter=surfaceDiv('alert-dialog-footer','rams-surface__footer');
export const AlertDialogTitle=React.forwardRef<React.ElementRef<typeof R.Title>,React.ComponentPropsWithoutRef<typeof R.Title>>(function AlertDialogTitle({className,...props},ref){return <R.Title {...props} ref={ref} className={cx('rams-surface__title',className)} data-rams-primitive="true" data-slot="alert-dialog-title"/>;});
export const AlertDialogDescription=React.forwardRef<React.ElementRef<typeof R.Description>,React.ComponentPropsWithoutRef<typeof R.Description>>(function AlertDialogDescription({className,...props},ref){return <R.Description {...props} ref={ref} className={cx('rams-surface__description',className)} data-rams-primitive="true" data-slot="alert-dialog-description"/>;});
export const AlertDialogAction=React.forwardRef<React.ElementRef<typeof R.Action>,React.ComponentPropsWithoutRef<typeof R.Action>>(function AlertDialogAction({asChild,children,...props},ref){return <R.Action {...props} ref={ref} asChild>{asChild?children:<Button>{children}</Button>}</R.Action>;});
export const AlertDialogCancel=React.forwardRef<React.ElementRef<typeof R.Cancel>,React.ComponentPropsWithoutRef<typeof R.Cancel>>(function AlertDialogCancel({asChild,children,...props},ref){return <R.Cancel {...props} ref={ref} asChild>{asChild?children:<Button variant="outline">{children}</Button>}</R.Cancel>;});

export const AlertDialogBody=surfaceDiv('alert-dialog-body','rams-surface__body');
