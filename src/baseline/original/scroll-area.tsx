"use client";

import { ScrollArea } from "../../primitives/scroll-area";

export function ScrollAreaDemo() {
  const editions = Array.from({ length: 50 }, (_, index) => {
    const number = index + 1;
    const names = ["Delta", "Barranca", "Patio", "Trama", "Sur"];
    const cities = ["Rosario", "Paraná", "Santa Fe", "Córdoba", "La Plata"];
    return {
      number,
      title: `${names[index % names.length]} / ${String(number).padStart(2, "0")}`,
      city: cities[index % cities.length],
    };
  });

  return (
    <section
      style={{
        display: "grid",
        width: "100%",
        gap: "var(--rams-detail-preview-scroll-caption-gap)",
      }}
      aria-label="Edition archive list"
    >
      <h3>Edition records</h3>
      <ScrollArea
        type="always"
        style={{
          width: "100%",
          maxWidth: "var(--rams-detail-preview-measure-wide)",
          height: "var(--rams-detail-preview-scroll-list-height)",
        }}
        viewportProps={{ "aria-label": "50 numbered edition records" }}
      >
        <ol
          style={{
            margin: 0,
            listStyle: "none",
            padding: "var(--rams-detail-space-3)",
          }}
        >
          {editions.map((edition) => (
            <li
              key={edition.number}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "baseline",
                justifyContent: "space-between",
                columnGap: "var(--rams-detail-space-3)",
                rowGap: "var(--rams-detail-space-1)",
                borderBottom:
                  edition.number === 50
                    ? 0
                    : "var(--rams-detail-primitive-border-width) solid var(--rams-border, currentColor)",
                paddingBlock: "var(--rams-detail-space-2)",
              }}
            >
              <span>{edition.title}</span>
              <span>{edition.city}</span>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </section>
  );
}

export function ScrollAreaHorizontalDemo() {
  const editions = [
    {
      title: "Delta / 08",
      city: "Rosario",
      stock: "Cotton stock",
      mark: "M32 32 320 32 320 388 32 388Z",
    },
    {
      title: "Barranca / 09",
      city: "Paraná",
      stock: "Uncoated stock",
      mark: "M32 388 320 32 608 388Z",
    },
    {
      title: "Patio / 10",
      city: "Santa Fe",
      stock: "Recycled stock",
      mark: "M32 32h576v112H32zm0 244h576v112H32z",
    },
    {
      title: "Trama / 11",
      city: "Córdoba",
      stock: "Linen stock",
      mark: "M32 32h180v356H32zm216 0h180v356H248zm216 0h112v356H464z",
    },
    {
      title: "Sur / 12",
      city: "La Plata",
      stock: "Cotton stock",
      mark: "M32 32h576v356H32zm72 72v212h432V104z",
    },
    {
      title: "Río / 13",
      city: "Buenos Aires",
      stock: "Recycled stock",
      mark: "M32 32h576v356H32zm0 178h576",
    },
    {
      title: "Senda / 14",
      city: "Mendoza",
      stock: "Uncoated stock",
      mark: "M32 388 176 32h144L176 388zm288 0L320 32h144l144 356z",
    },
  ];

  return (
    <section
      style={{
        display: "grid",
        width: "100%",
        gap: "var(--rams-detail-preview-scroll-caption-gap)",
      }}
      aria-label="Print edition gallery"
    >
      <h3>Seven print editions</h3>
      <ScrollArea
        type="always"
        scrollbars="horizontal"
        style={{ width: "100%", maxWidth: "var(--rams-detail-preview-measure-full)" }}
        viewportProps={{
          "aria-label": "Seven illustrated print editions",
          style: {
            boxSizing: "border-box",
            paddingBlock: "var(--rams-detail-space-1)",
            paddingInline: "var(--rams-detail-space-1)",
            paddingBottom: "calc(var(--rams-detail-space-1) * 2.5)",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            width: "max-content",
            alignItems: "flex-start",
            gap: "var(--rams-detail-space-4)",
            paddingInline: "var(--rams-detail-space-1)",
            paddingBlock: "var(--rams-detail-space-1)",
          }}
        >
          {editions.map((edition, index) => (
            <figure
              key={edition.title}
              style={{ margin: 0, width: "var(--rams-detail-preview-scroll-edition-width)", flexShrink: 0 }}
            >
              <svg
                viewBox="0 0 640 420"
                role="img"
                aria-label={`${edition.title} abstract print`}
                style={{
                  display: "block",
                  aspectRatio: "var(--rams-detail-preview-carousel-artwork-ratio)",
                  width: "100%",
                  borderRadius: "var(--radius-control)",
                  background: "var(--background, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))",
                  color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
                }}
              >
                <rect
                  width="640"
                  height="420"
                  fill="var(--background, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))"
                />
                <path d={edition.mark} fill="currentColor" />
                <circle
                  cx={index % 2 === 0 ? 520 : 120}
                  cy={index % 3 === 0 ? 100 : 320}
                  r="28"
                  fill="var(--background, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))"
                />
                <path
                  d="M32 210h576"
                  stroke="var(--background, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))"
                  strokeWidth="var(--rams-detail-preview-edition-cutout-stroke)"
                />
              </svg>
              <figcaption
                style={{
                  display: "grid",
                  gap: "var(--rams-detail-space-1)",
                  paddingBlock: "var(--rams-detail-space-2)",
                }}
              >
                <span>{edition.title}</span>
                <span>
                  {edition.city} · {edition.stock}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}

export default ScrollAreaDemo;
