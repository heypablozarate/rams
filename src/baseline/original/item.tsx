"use client";

import { useState } from "react";
import { Button } from "../../primitives/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "../../primitives/item";

export function ItemDemo() {
  const [shortlisted, setShortlisted] = useState(false);

  return (
    <section
      style={{
        display: "grid",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-extra-wide)",
        gap: "var(--rams-detail-space-1)",
      }}
      aria-label="Edition records"
    >
      <Item variant="outline">
        <ItemMedia variant="icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M4 17 17 4M7 20 20 7M4 11 11 4M13 20l7-7"
              stroke="currentColor"
              strokeWidth="var(--rams-detail-preview-item-glyph-stroke)"
            />
          </svg>
        </ItemMedia>
        <ItemContent>
          <ItemTitle asChild>
            <h3>Delta / 08</h3>
          </ItemTitle>
          <ItemDescription>Rosario · Cotton stock</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShortlisted((value) => !value)}
          >
            {shortlisted ? "Remove from list" : "Add to shortlist"}
          </Button>
        </ItemActions>
      </Item>

      <Item asChild variant="outline" size="sm">
        <a href="https://pablozarate.com">
          <ItemMedia variant="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 19 19 5M7 5h12v12"
                stroke="currentColor"
                strokeWidth="var(--rams-detail-preview-item-glyph-stroke)"
              />
            </svg>
          </ItemMedia>
          <ItemContent>
            <ItemTitle asChild>
              <span>pablozarate.com</span>
            </ItemTitle>
            <ItemDescription>Open the portfolio website</ItemDescription>
          </ItemContent>
          <ItemActions aria-hidden="true">
            <span>↗</span>
          </ItemActions>
        </a>
      </Item>

      {shortlisted && (
        <p role="status" aria-live="polite">
          Delta / 08 is on the shortlist.
        </p>
      )}
    </section>
  );
}

export function ItemVariant() {
  return (
    <section
      style={{
        display: "grid",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-extra-wide)",
        gap: "var(--rams-detail-space-1)",
      }}
      aria-label="Item surfaces"
    >
      <figure
        style={{ display: "grid", gap: "var(--rams-detail-space-1)", margin: 0 }}
      >
        <figcaption>Default surface</figcaption>
        <Item variant="default">
          <ItemMedia variant="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 18 18 4M7 20 20 7M4 11 11 4"
                stroke="currentColor"
                strokeWidth="var(--rams-detail-preview-item-glyph-stroke)"
              />
            </svg>
          </ItemMedia>
          <ItemContent>
            <ItemTitle asChild>
              <h3>Delta / 08</h3>
            </ItemTitle>
            <ItemDescription>Rosario · Cotton stock</ItemDescription>
          </ItemContent>
          <ItemActions>
            <span>Six sheets</span>
          </ItemActions>
        </Item>
      </figure>
      <figure
        style={{ display: "grid", gap: "var(--rams-detail-space-1)", margin: 0 }}
      >
        <figcaption>Outline surface</figcaption>
        <Item variant="outline">
          <ItemMedia variant="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 18 18 4M7 20 20 7M4 11 11 4"
                stroke="currentColor"
                strokeWidth="var(--rams-detail-preview-item-glyph-stroke)"
              />
            </svg>
          </ItemMedia>
          <ItemContent>
            <ItemTitle asChild>
              <h3>Delta / 08</h3>
            </ItemTitle>
            <ItemDescription>Rosario · Cotton stock</ItemDescription>
          </ItemContent>
          <ItemActions>
            <span>Six sheets</span>
          </ItemActions>
        </Item>
      </figure>
      <figure
        style={{ display: "grid", gap: "var(--rams-detail-space-1)", margin: 0 }}
      >
        <figcaption>Muted surface</figcaption>
        <Item variant="muted">
          <ItemMedia variant="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 18 18 4M7 20 20 7M4 11 11 4"
                stroke="currentColor"
                strokeWidth="var(--rams-detail-preview-item-glyph-stroke)"
              />
            </svg>
          </ItemMedia>
          <ItemContent>
            <ItemTitle asChild>
              <h3>Delta / 08</h3>
            </ItemTitle>
            <ItemDescription>Rosario · Cotton stock</ItemDescription>
          </ItemContent>
          <ItemActions>
            <span>Six sheets</span>
          </ItemActions>
        </Item>
      </figure>
    </section>
  );
}

export default ItemDemo;
