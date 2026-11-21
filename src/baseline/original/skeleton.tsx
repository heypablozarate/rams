import { Skeleton } from "../../primitives/skeleton";
export function SkeletonDemo() {
  return (
    <div
      role="status"
      aria-label="Preparing the edition record"
      style={{
        display: "flex",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-narrow)",
        alignItems: "center",
        gap: "var(--rams-detail-space-4)",
      }}
    >
      <Skeleton
        aria-hidden="true"
        style={{
          width: "var(--rams-detail-preview-skeleton-avatar-size)",
          height: "var(--rams-detail-preview-skeleton-avatar-size)",
          flexShrink: 0,
          borderRadius: "var(--rams-detail-radius-pill)",
        }}
      />
      <div
        style={{
          display: "grid",
          flex: "1 1 0%",
          gap: "var(--rams-detail-space-3)",
        }}
      >
        <Skeleton aria-hidden="true" style={{ height: "var(--rams-detail-preview-skeleton-line-height)", width: "var(--rams-detail-preview-skeleton-line-primary-width)" }} />
        <Skeleton
          aria-hidden="true"
          style={{ height: "var(--rams-detail-preview-skeleton-line-height)", width: "100%" }}
        />
      </div>
    </div>
  );
}
export function SkeletonCard() {
  return (
    <div
      role="status"
      aria-label="Preparing the cover preview"
      style={{
        display: "grid",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-narrow)",
        gap: "var(--rams-detail-space-4)",
      }}
    >
      <Skeleton
        aria-hidden="true"
        style={{ aspectRatio: "var(--rams-detail-preview-skeleton-card-aspect-ratio)", width: "100%" }}
      />
      <Skeleton aria-hidden="true" style={{ height: "var(--rams-detail-preview-skeleton-line-height)", width: "var(--rams-detail-preview-skeleton-card-primary-width)" }} />
      <Skeleton aria-hidden="true" style={{ height: "var(--rams-detail-preview-skeleton-line-height)", width: "var(--rams-detail-preview-skeleton-card-secondary-width)" }} />
    </div>
  );
}
