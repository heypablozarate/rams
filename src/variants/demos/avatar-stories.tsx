import { printPreviewGeometry } from "@/variants/print-preview-geometry";
import { useState, useId, type CSSProperties } from "react";
import { collectionPresentation } from "@/primitives/collection-presentation";
import { Button } from "@/primitives/button";
import {
  Avatar,
  type AvatarProps,
} from "@/variants/vendor/registry/components/avatar/avatar";
import { AvatarGroup } from "@/variants/vendor/registry/components/avatar-group/avatar-group";
const stationPaint = printPreviewGeometry.encodedArtwork.stationAvatar;
function stationMark(index: number) {
  const drawing =
    index === 0
      ? '<path d="M12 42 32 10 52 42Z"/>'
      : index === 1
        ? '<circle cx="32" cy="32" r="20"/><path d="M12 32h40M32 12v40"/>'
        : index === 2
          ? '<path d="M12 18h40v28H12ZM12 18l40 28M52 18 12 46"/>'
          : index === 3
            ? '<path d="M12 12h40v40H12Zm10 10h20v20H22Z"/>'
            : '<path d="M10 24c12-24 32 24 44 0M10 40c12-24 32 24 44 0"/>';
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${stationPaint.paper}"/><g fill="none" stroke="${stationPaint.ink}" stroke-width="${stationPaint.strokeWidth}">` +
        drawing +
        "</g></svg>",
    )
  );
}
const stations = [
  { name: "Paraná Desk", src: stationMark(0), task: "Cover lettering" },
  { name: "Delta Press", src: stationMark(1), task: "Ink proof" },
  { name: "Sur Table", src: stationMark(2), task: "Fold scoring" },
  { name: "Patio Rack", src: stationMark(3), task: "Sheet drying" },
  { name: "Río Bench", src: stationMark(4), task: "Edition collation" },
];
const layout: CSSProperties = {
  display: "grid",
  gap: "var(--rams-detail-docs-space-roomy)",
  width: "100%",
  minWidth: 0,
  maxWidth: "var(--rams-detail-preview-avatar-measure)",
  marginInline: "auto",
  color: "var(--foreground,var(--rams-ink))",
  fontSize: "var(--type-control-size)",
};
const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,var(--rams-detail-preview-avatar-station-min-inline-size)),1fr))",
  alignItems: "start",
  gap: "var(--rams-detail-preview-reading-section-gap)",
  width: "100%",
  minWidth: 0,
};
function Station({
  caption,
  task,
  ...props
}: AvatarProps & { caption?: string; task?: string }) {
  const description = caption ?? task;
  return (
    <div
      style={{
        display: "grid",
        justifyItems: "center",
        alignContent: "start",
        gap: "var(--rams-detail-docs-space-tight)",
        minWidth: 0,
        textAlign: "center",
      }}
    >
      <Avatar {...props} />
      <strong
        style={{ fontWeight: "var(--rams-detail-label-weight)", overflowWrap: "anywhere", maxWidth: "100%" }}
      >
        {props.name}
      </strong>
      {description && (
        <span
          style={{
            fontSize: "var(--type-caption-size)",
            color: "var(--muted-foreground,var(--rams-muted))",
            maxWidth: "100%",
            overflowWrap: "anywhere",
          }}
        >
          {description}
        </span>
      )}
    </div>
  );
}
export type AvatarStoryVariant =
  | "reference"
  | "sizes"
  | "presence"
  | "initials"
  | "group";
export interface AvatarStoriesProps {
  variant?: AvatarStoryVariant;
}
export function AvatarReferenceStory() {
  const [index, setIndex] = useState(0),
    station = stations[index];
  return (
    <div style={layout}>
      <Station {...station} size="lg" caption={station.task} />
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIndex((value) => (value + 1) % stations.length)}
      >
        Next station
      </Button>
    </div>
  );
}
export function AvatarSizesStory() {
  const sizes = [
    { size: "sm", caption: "Small" },
    { size: "default", caption: "Default" },
    { size: "lg", caption: "Large" },
    { size: "xl", caption: "Extra large" },
  ] as const;
  return (
    <div style={layout}>
      <div style={grid}>
        {sizes.map(({ size, caption }) => (
          <Station key={size} {...stations[0]} size={size} caption={caption} />
        ))}
      </div>
    </div>
  );
}
export function AvatarPresenceStory() {
  const [state, setState] = useState<AvatarProps["status"]>("online");
  return (
    <div style={layout}>
      <Station
        {...stations[0]}
        size="lg"
        status={state}
        caption={state ? "Desk " + state : "Availability not shown"}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          setState((value) =>
            value === "online"
              ? "offline"
              : value === "offline"
                ? undefined
                : "online",
          )
        }
      >
        {state === "online"
          ? "Set desk offline"
          : state === "offline"
            ? "Hide availability"
            : "Set desk online"}
      </Button>
      <span role="status">
        {state ? "Paraná Desk is " + state : "No availability shown"}
      </span>
    </div>
  );
}
export function AvatarInitialsStory() {
  const [marks, setMarks] = useState(false);
  return (
    <div style={layout}>
      <div style={grid}>
        {stations.slice(0, collectionPresentation.avatarInitialsDemoStations).map((station) => (
          <Station
            key={station.name}
            name={station.name}
            src={marks ? station.src : undefined}
            size="lg"
            caption={
              marks
                ? station.task
                : station.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
            }
          />
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setMarks((value) => !value)}
      >
        {marks ? "Use initials" : "Load station marks"}
      </Button>
    </div>
  );
}
export function AvatarGroupStory() {
  const [expanded, setExpanded] = useState(false);
  const membersId=useId();
  return (
    <div style={layout}>
      <AvatarGroup
        members={stations}
        max={expanded ? stations.length : collectionPresentation.avatarGroupDemoCollapsedStations}
        size="default"
        label="Workshop stations"
      />
      <Button
        type="button"
        variant="secondary"
        aria-expanded={expanded}
        aria-controls={membersId}
        onClick={() => setExpanded((value) => !value)}
      >
        {expanded ? "Collapse stations" : "Show all stations"}
      </Button>
      {(
        <ul
          id={membersId}
          hidden={!expanded}
          aria-label="Station assignments"
          style={{ margin: 0, paddingInlineStart: "var(--rams-detail-docs-list-inset)", lineHeight: "var(--type-body-leading, var(--rams-detail-native-body-leading-fallback))" }}
        >
          {stations.map((station) => (
            <li key={station.name}>
              {station.name} · {station.task}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export const avatarStoryVariants = [
  {
    id: "reference",
    title: "Station identity",
    component: AvatarReferenceStory,
  },
  { id: "sizes", title: "Four sizes", component: AvatarSizesStory },
  { id: "presence", title: "Availability", component: AvatarPresenceStory },
  {
    id: "initials",
    title: "Initials and marks",
    component: AvatarInitialsStory,
  },
  { id: "group", title: "Station collection", component: AvatarGroupStory },
] as const;
export function AvatarStories({ variant = "reference" }: AvatarStoriesProps) {
  const Story =
    avatarStoryVariants.find((story) => story.id === variant)?.component ??
    AvatarReferenceStory;
  return <Story />;
}
