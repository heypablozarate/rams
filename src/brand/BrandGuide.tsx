import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Wordmark } from './Wordmark';
import styles from './brand.module.css';
import { brandCopy as copy } from './brand-content';

type TextTag = 'p' | 'span' | 'h1' | 'h2' | 'h3';
function Text({ node, as: Tag = 'p', className = '' }: { node: string; as?: TextTag; className?: string }) {
  return <Tag data-brand-text className={className}>{copy[node]}</Tag>;
}
function Mark({ master = 200 }: { master?: 200 | 124 | 76 | 48 }) {
  return <span className={styles.mark}><Wordmark master={master} /></span>;
}
function Editorial({ master = 200 }: { master?: 200 | 124 | 76 | 48 }) {
  return <div className={styles.editorial} data-master={master}>
    <Text node="signatureLead" as="span" className={styles.love} />
    <Mark master={master} />
  </div>;
}
function ClearSpace() {
  const probe = useRef<HTMLSpanElement>(null);
  const [unit, setUnit] = useState<number>();
  useLayoutEffect(() => {
    const element = probe.current!;
    const measure = () => setUnit(element.getBoundingClientRect().width);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    document.fonts.addEventListener("loadingdone", measure);
    measure();
    return () => { observer.disconnect(); document.fonts.removeEventListener("loadingdone", measure); };
  }, []);
  return <div className={styles.safeArea} data-brand-example data-clear-space style={{"--brand-m-width":unit === undefined ? undefined : `${unit}px`} as CSSProperties}>
    <span ref={probe} data-m-unit className={styles.mUnit} aria-hidden="true">M</span>
    <Mark />
  </div>;
}
const boardIds = ['construction', 'versions', 'sizes'];
function BoardHeader({ index, section, navigation, title, intro }: { index: number; section?: string; navigation?: string[]; title: string; intro: string }) {
  return <header className={styles.boardHeader}>
    {section && <Text node={section} className={styles.sectionName} />}
    <Text node={title} as={index === 0 ? 'h1' : 'h2'} className={styles.title} />
    {index === 0 && <div data-brand-text className={styles.heroWordmark} data-brand-example><Mark /></div>}
    <Text node={intro} className={styles.introduction} />
    {navigation && <nav className={styles.navigation} aria-label="Brand">{navigation.map((node,item)=><a key={node} href={`#brand-${boardIds[item]}`} onClick={event=>{event.preventDefault();document.getElementById(`brand-${boardIds[item]}`)?.scrollIntoView();}}><Text node={node} as="span" /></a>)}</nav>}
  </header>;
}

export default function BrandGuide() {
  const scale = useRef<HTMLDivElement>(null);
  const [shownSizes, setShownSizes] = useState<Record<number, number>>({});
  useLayoutEffect(() => {
    const measure = () => {
      const sizes: Record<number, number> = {};
      scale.current?.querySelectorAll<HTMLElement>('[data-brand-scale]').forEach(row => {
        const mark = row.querySelector<HTMLElement>('[data-wordmark]');
        if (mark) sizes[Number(row.dataset.master)] = Math.round(parseFloat(getComputedStyle(mark).fontSize) * 10) / 10;
      });
      setShownSizes(previous => JSON.stringify(previous) === JSON.stringify(sizes) ? previous : sizes);
    };
    const observer = new ResizeObserver(measure);
    if (scale.current) observer.observe(scale.current);
    document.fonts.addEventListener('loadingdone', measure);
    measure();
    return () => { observer.disconnect(); document.fonts.removeEventListener('loadingdone', measure); };
  }, []);
  return <div className={styles.guide} data-brand-guide>
    <section id="brand-construction" className={styles.board}>
      <BoardHeader index={0} section="section" navigation={['construction', 'versions', 'sizes']} title="title" intro="introduction" />
      <div className={styles.anatomy}>
        <div className={styles.wordmarkAnatomy}>
          <div className={styles.indexedDescription}><Text node="wordmarkIndex" as="span" className={styles.index} /><Text node="wordmarkTitle" as="h2" className={styles.exampleTitle} /></div>
          <Text node="wordmarkMaster" className={styles.label} />
          <Text node="wordmarkDescription" className={styles.description} />
        </div>
        <aside className={styles.construction}>
          <Text node="constructionTitle" className={`${styles.label} ${styles.accent}`} />
          <Text node="constructionValues" className={styles.constructionValues} />
          <Text node="constructionNote" className={styles.warning} />
        </aside>
      </div>
      <div className={styles.editorialAnatomy}>
        <div className={styles.indexedDescription}><Text node="signatureIndex" as="span" className={styles.index} /><Text node="signatureTitle" as="h2" className={styles.exampleTitle} /></div>
        <div data-brand-text className={styles.mainEditorial} data-brand-example><Editorial /></div>
        <Text node="signatureMaster" className={styles.label} />
        <Text node="signatureDescription" className={styles.description} />
      </div>
    </section>

    <section id="brand-versions" className={styles.board}>
      <BoardHeader index={1} title="versions" intro="versionsIntroduction" />
      <div className={styles.usageExamples}>
        <div className={styles.usageExample}>
          <Text node="lightSurface" className={styles.label} />
          <div className={styles.lightUsage}>
            <div className={styles.safeAreaViewport} data-brand-text><ClearSpace /></div>
          </div>
        </div>
        <div className={styles.usageExample}>
          <Text node="darkSurface" className={styles.label} />
          <div className={styles.darkUsage} data-brand-text><div data-brand-text className={styles.darkEditorial} data-brand-example><Editorial /></div></div>
        </div>
      </div>
      <Text node="clearSpace" className={styles.usageNotes} />
      <div className={styles.usageRules}>
        <div><Text node="usageTitle" as="h3" className={styles.label} /><Text node="usage" className={styles.ruleCopy} /></div>
        <div>
          <Text node="colorsTitle" as="h3" className={styles.label} />
          <div className={styles.colorVariant}><div className={styles.swatches}><span className={styles.blackSwatch} data-brand-text /><span className={styles.orangeSwatch} data-brand-text /></div><Text node="colorsDefault" /></div>
          <div className={styles.colorVariant}><div className={styles.swatches}><span className={styles.blackSwatch} data-brand-text /><span className={styles.whiteSwatch} data-brand-text /></div><Text node="colorsMonochrome" /></div>
        </div>
        <div><Text node="avoidTitle" as="h3" className={styles.label} /><Text node="avoid" className={styles.ruleCopy} /></div>
      </div>
    </section>

    <section id="brand-sizes" className={styles.board}>
      <BoardHeader index={2} title="sizes" intro="sizesIntroduction" />
      <h3 className={styles.exampleTitle}>Signature scale</h3>
      <div ref={scale} className={styles.scaleTable}>
        <div className={styles.scaleColumnHeadings}><span>Original master</span><Text node="signatureTitle" className={styles.label} /></div>
        <div className={styles.scaleRow} data-master="200" data-brand-scale style={{"--brand-display-size":"var(--rams-detail-brand-master-200-display-max)"} as CSSProperties}>
          <div className={styles.scaleLabel}><span data-rendered-size>{shownSizes[200] === undefined ? "" : `${shownSizes[200]} px`}</span><Text node="master200" className={styles.label} /></div>
          <div data-brand-text className={styles.scaleEditorial} data-brand-example><Editorial /></div>
        </div>
        <div className={styles.scaleRow} data-master="124" data-brand-scale style={{"--brand-display-size":"var(--rams-detail-brand-master-124-display-max)"} as CSSProperties}>
          <div className={styles.scaleLabel}><span data-rendered-size>{shownSizes[124] === undefined ? "" : `${shownSizes[124]} px`}</span><Text node="master124" className={`${styles.label} ${styles.accent}`} /></div>
          <div data-brand-text className={styles.scaleEditorial} data-brand-example><Editorial master={124} /></div>
        </div>
        <div className={styles.scaleRow} data-master="76" data-brand-scale style={{"--brand-display-size":"var(--rams-detail-brand-master-76-display-max)"} as CSSProperties}>
          <div className={styles.scaleLabel}><span data-rendered-size>{shownSizes[76] === undefined ? "" : `${shownSizes[76]} px`}</span><Text node="master76" className={`${styles.label} ${styles.accent}`} /></div>
          <div data-brand-text className={styles.scaleEditorial} data-brand-example><Editorial master={76} /></div>
        </div>
        <div className={styles.scaleRow} data-master="48" data-brand-scale style={{"--brand-display-size":"var(--rams-detail-brand-master-48-display-max)"} as CSSProperties}>
          <div className={styles.scaleLabel}><span data-rendered-size>{shownSizes[48] === undefined ? "" : `${shownSizes[48]} px`}</span><Text node="master48" className={`${styles.label} ${styles.accent}`} /></div>
          <div data-brand-text className={styles.scaleEditorial} data-brand-example><Editorial master={48} /></div>
        </div>
        <Text node="ratio" className={styles.scaleNote} />
      </div>
    </section>
  </div>;
}
