"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { publicHeaderGeometry } from "@/primitives/public-header-geometry";
import "./header.css";
import { GlassHeaderLayer } from "./glass-header-layer";

const desktopQuery = `(min-width: ${publicHeaderGeometry.desktopMinRem}rem)`;

type NavItem = { href: string; label: string };
export type PublicHeaderProps = {
  currentPath: string;
  navItems: NavItem[];
  wordmark: ReactNode;
  copy: { primaryNavigationLabel: string; mobileNavigationLabel: string; openNavigationLabel: string; closeNavigationLabel: string; menuLabel: string; };
};

/** Document-level fixed navigation. The glass layer and its parameters are shared with the shell. */
export function PublicHeader({ currentPath, navItems, wordmark, copy }: PublicHeaderProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pendingReturn = useRef<Element | null>(null);
  const focusOwner = useRef<Element | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = useCallback((restore: boolean) => {
    pendingReturn.current = restore ? (document.activeElement === document.body ? focusOwner.current : document.activeElement) : null;
    if (!restore) focusOwner.current = null;
    setOpen(false);
  }, []);
  useLayoutEffect(() => {
    if (open || !pendingReturn.current) return;
    const from = pendingReturn.current;
    pendingReturn.current = null;
    // A subsequent interaction owns focus; never override it after a close.
    if (document.activeElement !== from && document.activeElement !== document.body) return;
    if (window.matchMedia(desktopQuery).matches) {
      (rootRef.current?.querySelector<HTMLElement>('.site-nav-link[aria-current="page"]') ?? rootRef.current?.querySelector<HTMLElement>('.site-nav-link'))?.focus();
    } else menuButtonRef.current?.focus();
  }, [open]);
  useEffect(() => {
    const onScroll = () => setScrolled(Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop) > publicHeaderGeometry.glassScrollThresholdPx);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); close(true); } };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", escape);
    const desktop = window.matchMedia(desktopQuery);
    const outside = (event: Event) => { if (!rootRef.current?.contains(event.target as Node)) focusOwner.current = null; };
    document.addEventListener("focusin", outside); document.addEventListener("pointerdown", outside);
    const resize = () => {
      if (!desktop.matches) return;
      const active = document.activeElement;
      const owned = !!rootRef.current?.contains(active) || (active === document.body && !!focusOwner.current?.isConnected);
      close(owned);
    };
    resize(); desktop.addEventListener("change", resize);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", escape); desktop.removeEventListener("change", resize); document.removeEventListener("focusin", outside); document.removeEventListener("pointerdown", outside); };
  }, [open, close]);
  const toggle = () => { if (open) close(true); else { pendingReturn.current = null; setOpen(true); } };
  return <div ref={rootRef} className="rams-public-header rams-public-glass-scope" data-open={open} data-glass={scrolled || open}
    onFocusCapture={event => { focusOwner.current = event.target; }}
    onBlurCapture={event => { if (open && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close(false); }}>
    {open && <div className="rams-public-header-screen"><GlassHeaderLayer active hairline={false} /></div>}
    <header className="rams-public-header-bar">
      <GlassHeaderLayer active={scrolled && !open} hairline={scrolled && !open} />
      <div className="rams-public-header-inner">
        <a href="/" className="site-logo-link">{wordmark}</a>
        <nav aria-label={copy.primaryNavigationLabel} className="rams-public-header-desktop">
          <ul>{navItems.map(item => <li key={item.href}><a href={item.href} aria-current={currentPath === item.href ? "page" : undefined} className="site-nav-link">{item.label}</a></li>)}</ul>
        </nav>
        <button ref={menuButtonRef} type="button" className="rams-public-header-toggle" aria-expanded={open} aria-controls={id} aria-label={open ? copy.closeNavigationLabel : copy.openNavigationLabel}
          onClick={toggle} onTouchEnd={event => { event.preventDefault(); toggle(); }}>
          <span className="rams-public-header-sr">{copy.menuLabel}</span>
          <span aria-hidden="true" className="rams-public-header-bars"><span /><span /><span /></span>
        </button>
      </div>
    </header>
    <div id={id} hidden={!open} className="rams-public-header-mobile">
      <nav aria-label={copy.mobileNavigationLabel}><ul>{navItems.map(item => <li key={item.href}><a href={item.href} onClick={() => close(true)} aria-current={currentPath === item.href ? "page" : undefined} className="mobile-nav-link">{item.label}</a></li>)}</ul></nav>
    </div>
  </div>;
}
