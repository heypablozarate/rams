import { useId } from "react";
import { AspectRatio } from "../../primitives/aspect-ratio";
const artworkWidth = 640;
const artworkHeight = 360;
export function AspectRatioDemo() {
  const id = useId();
  return (
    <div style={{ width: "100%", maxWidth: "var(--rams-detail-preview-media-measure)" }}>
      <AspectRatio
        ratio={artworkWidth / artworkHeight}
        style={{
          overflow: "hidden",
          borderRadius: "var(--radius-control)",
          background: "var(--muted, var(--rams-subtle))",
        }}
      >
        <svg
          viewBox={`0 0 ${artworkWidth} ${artworkHeight}`}
          role="img"
          aria-labelledby={id}
          style={{ height: "100%", width: "100%" }}
        >
          <title id={id}>
            Terrace study in Rosario: layered steps and a round window
          </title>
          <rect
            width="100%"
            height="100%"
            fill="var(--muted, var(--rams-subtle))"
          />
          <path
            d="M0 300h160v-70h160v-70h160V90h160v270H0Z"
            fill="var(--foreground, var(--rams-ink))"
          />
          <circle
            cx="145"
            cy="112"
            r="54"
            fill="var(--background, var(--rams-surface))"
          />
          <path
            d="M0 322h640M240 0v360"
            stroke="var(--background, var(--rams-surface))"
            strokeWidth="var(--rams-detail-preview-plate-line-stroke)"
          />
        </svg>
      </AspectRatio>
    </div>
  );
}
