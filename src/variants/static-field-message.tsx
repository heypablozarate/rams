interface StaticFieldMessageProps {
  id?: string;
  text?: string;
  alert?: boolean;
  slotClassName?: string;
  copyClassName?: string;
  srOnlyClassName?: string;
  wordsClassName?: string;
  wordClassName?: string;
}

/** Current field copy at its natural height, without retained or moving decorative copies. */
export function StaticFieldMessage({ id, text, alert, slotClassName, copyClassName, srOnlyClassName, wordsClassName, wordClassName }: StaticFieldMessageProps) {
  if (!text) return null;
  const words = text.split(" ");
  return <span className={slotClassName}>
    <span id={id} className={copyClassName} role={alert ? "alert" : undefined}>
      <span className={srOnlyClassName}>{text}</span>
      <span className={wordsClassName} aria-hidden="true">{words.map((word, index) => <span key={`${index}:${word}`} className={wordClassName}>{word}{index < words.length - 1 ? " " : null}</span>)}</span>
    </span>
  </span>;
}
