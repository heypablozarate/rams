"use client";
/* eslint-disable @next/next/no-img-element -- plain images keep the block portable outside Next.js. */

import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";
import { AnimatePresence, LayoutGroup, animate, motion, usePresence, useMotionValue, visualElementStore } from "motion/react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { ArrowLeft, ChevronLeft, ChevronRight } from "rams-icons";
import { createMotionTransaction, motionTransition } from "@/variants/motion-policy";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import { blogCategories, blogPosts } from "./blog-grid-data";
import type { BlogPost } from "./blog-grid-data";
import { collectionPresentation } from "@/primitives/collection-presentation";
import styles from "./blog-grid.module.css";

export type { BlogAuthor, BlogPost } from "./blog-grid-data";

export interface BlogGridProps {
  title?: string;
  description?: string;
  posts?: BlogPost[];
  /** Category filter labels, in order. "All" is added in front. */
  categories?: string[];
  /** Active category, or "All" (controlled). */
  category?: string;
  defaultCategory?: string;
  onCategoryChange?: (category: string) => void;
  /** One based page (controlled). */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Cards per page below the featured post. Defaults to 6. */
  pageSize?: number;
  /** Shows the newest post of the current filter as a large card on page one. Defaults to true. */
  showFeatured?: boolean;
  /** Link for each post. When set, cards render as links and the in-place reader is off. */
  getHref?: (post: BlogPost) => string;
  /** Called when a post opens, from a link or the in-place reader. */
  onPostOpen?: (post: BlogPost) => void;
  className?: string;
}

const smooth = motionTokens.spring.smooth;
const morph = motionTokens.spring.morph;
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const formatDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`));

function useControllable<T>(value: T | undefined, initial: T, onChange?: (next: T) => void) {
  const [inner, setInner] = useState(initial);
  const current = value !== undefined ? value : inner;
  const set = (next: T) => { if (value === undefined) setInner(next); onChange?.(next); };
  return [current, set] as const;
}

/** Springs its height when the page or filter changes, so the pagination below glides instead of jumping. Other resizes (a late font, a narrower window) apply at once. */
function AutoHeight({ changeKey, reduced, className, children }: { changeKey: string; reduced: boolean; className?: string; children: ReactNode }) {
  const clipRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const lastKey = useRef(changeKey), armed = useRef(false);
  useLayoutEffect(() => {
    if (lastKey.current === changeKey) return;
    lastKey.current = changeKey;
    armed.current = true;
  }, [changeKey]);
  useEffect(() => {
    const clip = clipRef.current, content = contentRef.current;
    if (!clip || !content || typeof ResizeObserver === "undefined") return;
    let controls: ReturnType<typeof animate> | undefined;
    const observer = new ResizeObserver(() => {
      const next = content.offsetHeight;
      controls?.stop();
      if (!next || reduced || height.get() === "auto" || !armed.current) { height.jump(next || "auto"); delete clip.dataset.clip; return; }
      armed.current = false;
      clip.dataset.clip = "";
      controls = animate(height, next, { ...smooth, onComplete: () => { delete clip.dataset.clip; } });
    });
    observer.observe(content);
    return () => { observer.disconnect(); controls?.stop(); delete clip.dataset.clip; };
  }, [height, reduced]);
  return <motion.div ref={clipRef} className={styles.clip} style={{ height }}>
    <div ref={contentRef} className={className}>{children}</div>
  </motion.div>;
}

function Meta({ post }: { post: BlogPost }) {
  return <p className={styles.meta}><span dir="auto">{post.category}</span><span aria-hidden="true">·</span><time dateTime={post.date} dir="ltr">{formatDate(post.date)}</time></p>;
}

function Byline({ post }: { post: BlogPost }) {
  return <div className={styles.byline}>
    {post.author.avatar ? <img className={styles.avatar} src={post.author.avatar} alt="" loading="lazy" /> : <span className={styles.avatar} aria-hidden="true" />}
    <span className={styles.authorName} dir="auto">{post.author.name}</span>
    <span className={styles.readTime}><bdi dir="ltr">{post.readTime} min read</bdi></span>
  </div>;
}

// Exiting content can animate visually without retaining stale interactive controls.
const PresentPage = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof motion.div>>(function PresentPage(props, ref) {
  const [present, remove] = usePresence();
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (!present && reduced) remove?.();
  }, [present, reduced, remove]);
  return <motion.div {...props} ref={ref} onAnimationComplete={definition => { props.onAnimationComplete?.(definition); if (!present) remove?.(); }} data-blog-page="" inert={!present} aria-hidden={present ? undefined : true} />;
});
const PresentPagination = forwardRef<HTMLElement, ComponentPropsWithoutRef<typeof motion.nav>>(function PresentPagination(props, ref) {
  const [present, remove] = usePresence();
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (!present && reduced) remove?.();
  }, [present, reduced, remove]);
  return <motion.nav {...props} ref={ref} onAnimationComplete={definition => { props.onAnimationComplete?.(definition); if (!present) remove?.(); }} inert={!present} aria-hidden={present ? undefined : true} />;
});

export function BlogGrid({
  title = "Journal",
  description = "",
  posts = blogPosts,
  categories = blogCategories,
  category: categoryProp,
  defaultCategory = "All",
  onCategoryChange,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageSize = collectionPresentation.blogGridPageSize,
  showFeatured = true,
  getHref,
  onPostOpen,
  className,
}: BlogGridProps) {
  const reduced = Boolean(useReducedMotion());
  const [entranceSettled, setEntranceSettled] = useState(false);
  const uid = useId();
  const rootRef = useRef<HTMLElement>(null);
  const [category, setCategoryState] = useControllable(categoryProp, defaultCategory, onCategoryChange);
  const [page, setPageState] = useControllable(pageProp, defaultPage, onPageChange);
  const [reading, setReading] = useState<BlogPost | null>(null);
  /** The post the reader just closed. Its image morphs back into its card while the rest of the index fades in around it. */
  const [returning, setReturning] = useState<string | null>(null);
  const lastOpened = useRef<string | null>(null);
  const pageFocus = useRef<{ owner: HTMLButtonElement; page: number } | null>(null);
  const interaction = useRef(createMotionTransaction());
  const returnGeneration = useRef(0);
  useEffect(() => () => interaction.current.cancel(), []);
  // Controlled navigation/data changes invalidate a pending return to the old view.
  useEffect(() => { interaction.current.cancel(); }, [categoryProp, pageProp, posts]);
  useLayoutEffect(() => {
    if (!reduced) return;
    setReturning(null);
    setEntranceSettled(true);
    for (const node of rootRef.current?.querySelectorAll("[data-blog-enter]:not([inert])") ?? []) {
      const element = visualElementStore.get(node);
      element?.getValue("opacity")?.jump(1);
      element?.getValue("y")?.jump(0);
      element?.render();
    }
  }, [reduced]);

  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = category === "All" ? sorted : sorted.filter(post => post.category === category);
  const featured = showFeatured && filtered.length > 1 ? (filtered.find(post => post.featured) ?? filtered[0]) : null;
  const rest = featured ? filtered.filter(post => post !== featured) : filtered;
  const pageCount = Math.max(1, Math.ceil(rest.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const pagePosts = rest.slice((safePage - 1) * pageSize, safePage * pageSize);

  useLayoutEffect(() => {
    const request = pageFocus.current;
    pageFocus.current = null;
    if (!request || request.page !== safePage) return;
    // Only replace focus lost when this navigation disables its own step button.
    // A consumer that deliberately focused another control keeps that focus.
    const active = document.activeElement;
    if (active === request.owner || (active === document.body && request.owner.disabled)) {
      rootRef.current?.querySelector<HTMLButtonElement>('[aria-current="page"]')?.focus({ preventScroll: true });
    }
  }, [page, safePage, pageCount]);

  function scrollToTop() {
    const node = rootRef.current;
    if (node && node.getBoundingClientRect().top < 0) node.scrollIntoView({ behavior: "auto", block: "start" });
  }
  function setCategory(next: string) {
    if (next === category) return;
    interaction.current.begin();
    setEntranceSettled(reduced);
    setReturning(null);
    setCategoryState(next);
    setPageState(1);
  }
  function setPage(next: number, owner?: HTMLButtonElement) {
    if (next === safePage || next < 1 || next > pageCount) return;
    interaction.current.begin();
    setEntranceSettled(reduced);
    pageFocus.current = owner === document.activeElement && (next === 1 || next === pageCount) ? { owner, page: next } : null;
    setReturning(null);
    setPageState(next);
    scrollToTop();
  }
  function open(post: BlogPost, event: MouseEvent) {
    onPostOpen?.(post);
    if (getHref) return;
    event.preventDefault();
    interaction.current.begin();
    setEntranceSettled(reduced);
    setReturning(null);
    lastOpened.current = post.id;
    scrollToTop();
    setReading(post);
  }
  function close() {
    const transaction = interaction.current;
    const generation = transaction.begin();
    setEntranceSettled(reduced);
    returnGeneration.current = generation;
    const postId = lastOpened.current;
    setReturning(reduced ? null : postId);
    setReading(null);
    const frame = requestAnimationFrame(() => {
      if (!transaction.current(generation)) return;
      const card = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-post]") ?? []).find(node => node.dataset.post === postId && !node.closest("[inert]"));
      card?.focus({ preventScroll: true });
      card?.scrollIntoView({ block: "nearest", behavior: "auto" });
    });
    transaction.track(() => cancelAnimationFrame(frame));
  }

  const renderCard = (post: BlogPost, isFeatured = false) => {
    const href = getHref?.(post);
    const inner = <>
      {post.image && <motion.div layoutId={reduced ? undefined : `${uid}-image-${post.id}`} transition={motionTransition("morph", reduced)} className={styles.imageFrame}>
        <img className={styles.image} src={post.image.src} alt={post.image.alt} loading={isFeatured ? "eager" : "lazy"} />
      </motion.div>}
      <div className={styles.cardBody}>
        <Meta post={post} />
        <h3 dir="auto" className={isFeatured ? styles.featuredTitle : styles.cardTitle}>{post.title}</h3>
        <p dir="auto" className={styles.excerpt}>{post.excerpt}</p>
        <Byline post={post} />
      </div>
    </>;
    const className = isFeatured ? styles.featured : styles.card;
    const fades = returning !== null && (reduced || post.id !== returning);
    return <motion.a key={post.id} className={className} href={href ?? `#${post.id}`} data-post={post.id} onClick={event => open(post, event)} {...enterFade(fades)}>{inner}</motion.a>;
  };

  /** Fades a piece of the index or reader in on its own, so the shared image is never dimmed by a fading parent mid morph. */
  const enterFade = (on: boolean) => ({ "data-blog-enter": "", initial: on && !reduced ? { opacity: 0 } : false as const, animate: { opacity: 1 }, transition: motionTransition("enter", reduced) });
  const back = returning !== null;
  const returningGeneration = returnGeneration.current;
  const tabs = ["All", ...categories];
  const pageKey = `${category}-${safePage}`;

  return <section ref={rootRef} data-blog-entrance-settled={entranceSettled || undefined} className={[styles.root, className].filter(Boolean).join(" ")} aria-label={title}>
    <LayoutGroup id={uid}>
      <div className={styles.inner}>
        {/* One spatial owner: shared image; ancestors never fade during the morph. */}
          {reading ? <motion.article key="reader" className={styles.reader} aria-labelledby={`${uid}-reader-title`}>
            <motion.button type="button" className={styles.back} onClick={close} autoFocus {...enterFade(true)}><ArrowLeft className={styles.readerBackGlyph} aria-hidden="true" />All posts</motion.button>
            <motion.header className={styles.readerHead} {...enterFade(true)}>
              <Meta post={reading} />
              <h2 dir="auto" id={`${uid}-reader-title`} className={styles.readerTitle}>{reading.title}</h2>
              <Byline post={reading} />
            </motion.header>
            {reading.image && <motion.div layoutId={reduced ? undefined : `${uid}-image-${reading.id}`} className={styles.readerImage} {...(reduced ? enterFade(true) : {})} transition={motionTransition("morph", reduced)}>
              <img className={styles.image} src={reading.image.src} alt={reading.image.alt} />
            </motion.div>}
            <motion.div data-blog-enter="" className={styles.readerBody} initial={reduced ? false : { opacity: 0, y: motionTokens.keyframes.blogGrid.readerEnterPx }} animate={{ opacity: 1, y: 0 }} transition={{ ...motionTransition("enter", reduced), delay: reduced ? motionTokens.reduced.stagger : motionTokens.sequence.handoff }}>
              <p dir="auto" className={styles.lead}>{reading.excerpt}</p>
              {(reading.body ?? []).map(paragraph => <p key={paragraph} dir="auto">{paragraph}</p>)}
            </motion.div>
          </motion.article> : <motion.div key="index" className={styles.index}>
            <motion.header className={styles.header} {...enterFade(back)} onAnimationComplete={() => { if (interaction.current.current(returningGeneration)) setReturning(null); }}>
              <h2 dir="auto" className={styles.title}>{title}</h2>
              {description && <p dir="auto" className={styles.description}>{description}</p>}
            </motion.header>

            <motion.div className={styles.filters} role="group" aria-label="Filter by category" {...enterFade(back)}>
              {tabs.map(tab => <button key={tab} type="button" className={styles.filter} aria-pressed={tab === category} onClick={() => setCategory(tab)}>
                {tab === category && <motion.span layoutId={reduced ? undefined : `${uid}-filter`} className={styles.filterHighlight} transition={reduced ? { duration: motionTokens.reduced.duration } : morph} />}
                <span>{tab}</span>
              </button>)}
            </motion.div>

            <AutoHeight changeKey={`${pageKey}-${pageCount}`} reduced={Boolean(reduced)} className={styles.stack}>
            <AnimatePresence mode="popLayout" initial={false}>
              <PresentPage
                key={pageKey}
                data-blog-enter=""
                className={styles.page}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, pointerEvents: "none", transition: motionTransition("exit", reduced) }}
                transition={motionTransition("enter", reduced)}
              >
                {featured && safePage === 1 && renderCard(featured, true)}
                {pagePosts.length > 0 && <div className={styles.grid}>{pagePosts.map(post => renderCard(post))}</div>}
                {filtered.length === 0 && <p className={styles.empty}>No posts in {category} yet.</p>}
              </PresentPage>
            </AnimatePresence>

            <AnimatePresence mode="popLayout" initial={back}>
            {pageCount > 1 && <PresentPagination data-blog-enter="" key="pagination" className={styles.pagination} aria-label="Pagination" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: motionTransition("exit", reduced) }} transition={motionTransition("enter", reduced)}>
              <button type="button" className={styles.pageStep} onClick={event => setPage(safePage - 1, event.currentTarget)} disabled={safePage === 1} aria-label="Previous page"><ChevronLeft className={styles.pageGlyph} aria-hidden="true" /><span>Previous</span></button>
              <div className={styles.pageNumbers}>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map(number => <button key={number} type="button" className={styles.pageNumber} aria-current={number === safePage ? "page" : undefined} aria-label={`Page ${number}`} onClick={() => setPage(number)}>
                  {number === safePage && <motion.span layoutId={reduced ? undefined : `${uid}-page`} className={styles.pageHighlight} transition={reduced ? { duration: motionTokens.reduced.duration } : morph} />}
                  <span>{number}</span>
                </button>)}
              </div>
              <button type="button" className={styles.pageStep} onClick={event => setPage(safePage + 1, event.currentTarget)} disabled={safePage === pageCount} aria-label="Next page"><span>Next</span><ChevronRight className={styles.pageGlyph} aria-hidden="true" /></button>
            </PresentPagination>}
            </AnimatePresence>
            </AutoHeight>
          </motion.div>}
      </div>
    </LayoutGroup>
  </section>;
}

/** Preview: the blog index with the in-place reader. */
export function BlogGridBlock() {
  return <BlogGrid />;
}

export default BlogGridBlock;
