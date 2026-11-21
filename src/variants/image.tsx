import type { ComponentProps } from 'react';
export type StaticImageData = { src: string; width: number; height: number; blurDataURL?: string };
/** RAMS-only Vite bridge; leaves the existing RAMS/Next bridge unchanged. */
export default function Image({ src, fill, priority, quality: _quality, placeholder: _placeholder, blurDataURL: _blurDataURL, unoptimized: _unoptimized, ...props }: Omit<ComponentProps<'img'>, 'src'> & { src: string | StaticImageData; fill?: boolean; priority?: boolean; quality?: number; placeholder?: string; blurDataURL?: string; unoptimized?: boolean }) {
  const asset = typeof src === 'string' ? undefined : src;
  return <img src={typeof src === 'string' ? src : src.src} width={asset?.width} height={asset?.height} {...props} loading={priority ? 'eager' : props.loading || 'lazy'} style={{ ...(fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } as const : {}), ...props.style }} />;
}
