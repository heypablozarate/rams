"use client";

import { printPreviewGeometry } from "../../variants/print-preview-geometry";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "../../primitives/avatar";

const editionPaint = printPreviewGeometry.encodedArtwork.editionAvatar;
const editionArt =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${editionPaint.paper}"/><path d="M8 48 48 8M16 56 56 16M8 32 32 8M32 56 56 32" stroke="${editionPaint.ink}" stroke-width="${editionPaint.strokeWidth}"/><circle cx="32" cy="32" r="5" fill="${editionPaint.ink}"/></svg>`,
  );

export function AvatarDemo() {
  return (
    <section
      style={{
        display: "grid",
        width: "100%",
        gap: "var(--spacing, var(--rams-detail-native-spacing-fallback))",
      }}
      aria-label="Edition artwork avatars"
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 6)",
        }}
      >
        <figure
          style={{
            display: "grid",
            justifyItems: "center",
            gap: "var(--spacing, var(--rams-detail-native-spacing-fallback))",
            margin: 0,
          }}
        >
          <Avatar role="img" aria-label="Delta / 08 abstract print">
            <AvatarImage src={editionArt} alt="" />
            <AvatarFallback>08</AvatarFallback>
          </Avatar>
          <figcaption>Circular artwork</figcaption>
        </figure>
        <figure
          style={{
            display: "grid",
            justifyItems: "center",
            gap: "var(--spacing, var(--rams-detail-native-spacing-fallback))",
            margin: 0,
          }}
        >
          <Avatar
            role="img"
            aria-label="Barranca / 09 print mark"
            style={{ borderRadius: "var(--radius-control)" }}
          >
            <AvatarImage
              src="data:image/png;base64,not-valid-local-image-data"
              alt=""
              style={{ borderRadius: "var(--radius-control)" }}
            />
            <AvatarFallback style={{ borderRadius: "var(--radius-control)" }}>
              09
            </AvatarFallback>
          </Avatar>
          <figcaption>Rounded fallback</figcaption>
        </figure>
      </div>

      <figure
        style={{
          display: "grid",
          justifyItems: "start",
          gap: "var(--spacing, var(--rams-detail-native-spacing-fallback))",
          margin: 0,
        }}
      >
        <AvatarGroup aria-label="Three edition print marks">
          <Avatar role="img" aria-label="Delta / 08 abstract print">
            <AvatarImage src={editionArt} alt="" />
            <AvatarFallback>08</AvatarFallback>
          </Avatar>
          <Avatar role="img" aria-label="Barranca / 09 abstract print">
            <AvatarImage src={editionArt} alt="" />
            <AvatarFallback>09</AvatarFallback>
          </Avatar>
          <Avatar role="img" aria-label="Patio / 10 abstract print">
            <AvatarImage src={editionArt} alt="" />
            <AvatarFallback>10</AvatarFallback>
          </Avatar>
        </AvatarGroup>
        <figcaption>Overlapping edition marks</figcaption>
      </figure>
    </section>
  );
}

export default AvatarDemo;
