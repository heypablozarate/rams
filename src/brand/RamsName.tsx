import { Fragment, type ReactNode } from "react";
import styles from "./rams-name.module.css";

/** Product identity uses the licensed font's native ss09 R; prose keeps its own weight and color. */
export function RamsName({ children = "RAMS", logo = false, renderText }: {
  children?: "RAMS" | "Rams";
  logo?: boolean;
  renderText?: (name: string) => ReactNode;
}) {
  return <span className={styles.name} data-rams-name data-rams-logo={logo || undefined}>{renderText ? renderText(children) : children}</span>;
}

// Match product names in prose, leaving paths, installation IDs and rule IDs intact.
const productName = /((?<![\p{L}\p{N}_/.-])(?:RAMS|Rams)(?![\p{L}\p{N}_/-]|\.[\p{L}\p{N}_]))/u;

/** Compose text at the consumer, preserving the exact string and accessible reading order. */
export function RamsText({ children, renderText }: { children: string; renderText?: (text: string, offset: number) => ReactNode }) {
  let offset = 0;
  return <>{children.split(productName).map((part, index) => {
    const start = offset;
    offset += part.length;
    return part === "RAMS" || part === "Rams"
      ? <RamsName key={index} renderText={renderText ? name => renderText(name, start) : undefined}>{part as "RAMS" | "Rams"}</RamsName>
      : <Fragment key={index}>{renderText ? renderText(part, start) : part}</Fragment>;
  })}</>;
}
