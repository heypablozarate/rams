import styles from './wordmark.module.css';
/** Shared RAMS identity. The trademark keeps native glyph anatomy; color is its only independent styling. */
export function Wordmark({ compact = false, monochrome = false, className = '', master }: { compact?: boolean; monochrome?: boolean; className?: string; master?: 200 | 124 | 76 | 48 }) {
  return <span className={`${styles.wordmark} ${className}`} data-wordmark data-master={master} data-compact={compact || undefined} data-monochrome={monochrome || undefined} role="img" aria-label="PabloZarate™"><span aria-hidden="true">PabloZarate<span data-trademark className={styles.trademark}>™</span></span></span>;
}
