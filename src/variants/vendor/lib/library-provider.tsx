"use client";

/**
 * Lets an app swap the link and image elements RAMS components render.
 *
 * Without a provider, RAMS renders a plain `<a>` and `<img>`, so components work in any React app (Vite, Remix, Astro,
 * plain React). Wrap the app once to use your framework's or your own components instead:
 *
 *   import Link from "next/link";
 *   import Image from "@/variants/image";
 *   import { LibraryProvider } from "@/variants/vendor/lib/library-provider";
 *
 *   <LibraryProvider link={Link} image={Image}>{children}</LibraryProvider>
 *
 * Any component that accepts these props works, such as a locale-aware Link from next-intl or a React Router Link
 * wrapped to map `href` to `to`.
 */
import { createContext, createElement, useContext, useMemo, type AnchorHTMLAttributes, type ComponentType, type ImgHTMLAttributes, type ReactNode, type Ref } from "react";

/** The props RAMS passes to a link: an href plus ordinary anchor attributes. */
export interface LibraryLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  ref?: Ref<HTMLAnchorElement>;
}

/**
 * The props RAMS passes to an image. A subset of next/image's props, so next/image can be passed as is: either `fill`
 * (cover the positioned parent) or `width` and `height`, plus `sizes` and `priority` as hints.
 */
export interface LibraryImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height" | "loading" | "srcSet"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Fills the nearest positioned parent, like next/image's `fill`. */
  fill?: boolean;
  /** Loads the image eagerly with high priority, like next/image's `priority`. */
  priority?: boolean;
  loading?: "eager" | "lazy";
  ref?: Ref<HTMLImageElement>;
}

export type LibraryLinkComponent = ComponentType<LibraryLinkProps>;
export type LibraryImageComponent = ComponentType<LibraryImageProps>;

/** The default link: a plain anchor. */
export function LibraryAnchor(props: LibraryLinkProps) {
  return <a {...props} />;
}

const fillStyle = { position: "absolute", inset: 0, width: "100%", height: "100%" } as const;

/** The default image: a plain, lazily decoded `<img>` that understands `fill` and `priority`. */
export function LibraryImg({ alt, fill, priority, loading, style, ...props }: LibraryImageProps) {
  // eslint-disable-next-line @next/next/no-img-element -- the framework-free default; pass next/image through LibraryProvider instead.
  return <img alt={alt} decoding="async" {...props} loading={loading ?? (priority ? "eager" : "lazy")} fetchPriority={priority ? "high" : props.fetchPriority} style={fill ? { ...fillStyle, ...style } : style} />;
}

interface LibraryComponents {
  link: LibraryLinkComponent;
  image: LibraryImageComponent;
}

const LibraryContext = createContext<LibraryComponents>({ link: LibraryAnchor, image: LibraryImg });

export interface LibraryProviderProps {
  /** The link component RAMS renders for navigation, such as next/link or your own wrapped Link. Defaults to `<a>`. */
  link?: LibraryLinkComponent;
  /** The image component RAMS renders for photos, such as next/image. Defaults to `<img>`. */
  image?: LibraryImageComponent;
  children: ReactNode;
}

/** Sets the link and image components for every RAMS component inside it. Nested providers inherit what they do not set. */
export function LibraryProvider({ link, image, children }: LibraryProviderProps) {
  const parent = useContext(LibraryContext);
  const value = useMemo(() => ({ link: link ?? parent.link, image: image ?? parent.image }), [link, image, parent]);
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

/** The link component from the nearest LibraryProvider, or a plain anchor. */
export const useLibraryLink = () => useContext(LibraryContext).link;
/** The image component from the nearest LibraryProvider, or a plain img. */
export const useLibraryImage = () => useContext(LibraryContext).image;

/** What RAMS components render for a link: the provider's link component, or a plain anchor. */
export function LibraryLink(props: LibraryLinkProps) {
  return createElement(useLibraryLink(), props);
}

/** What RAMS components render for an image: the provider's image component, or a plain img. */
export function LibraryImage(props: LibraryImageProps) {
  return createElement(useLibraryImage(), props);
}
