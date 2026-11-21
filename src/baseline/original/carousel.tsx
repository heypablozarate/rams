"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "../../primitives/carousel";

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
] as const;

function EditionArtwork({
  title,
  city,
  stock,
  mark,
  index,
  total,
}: {
  title: string;
  city: string;
  stock: string;
  mark: string;
  index: number;
  total: number;
}) {
  return (
    <figure
      style={{
        display: "grid",
        alignContent: "start",
        gap: "var(--rams-detail-space-1)",
        margin: 0,
        minWidth: 0,
      }}
    >
      <svg
        viewBox="0 0 640 420"
        role="img"
        aria-label={`${title} abstract print`}
        style={{
          display: "block",
          aspectRatio: "var(--rams-detail-preview-carousel-artwork-ratio)",
          width: "100%",
          maxHeight: "var(--rams-detail-preview-carousel-artwork-block-max)",
          borderRadius: "var(--radius-control)",
          background: "var(--background, var(--rams-surface))",
          color: "var(--foreground, var(--rams-ink))",
        }}
      >
        <rect
          width="640"
          height="420"
          fill="var(--background, var(--rams-surface))"
        />
        <path d={mark} fill="currentColor" />
        <circle
          cx={index % 2 === 0 ? 520 : 120}
          cy={index % 3 === 0 ? 100 : 320}
          r="28"
          fill="var(--background, var(--rams-surface))"
        />
        <path
          d="M32 210h576"
          stroke="var(--background, var(--rams-surface))"
          strokeWidth="var(--rams-detail-preview-edition-cutout-stroke)"
        />
      </svg>
      <figcaption
        style={{
          display: "grid",
          gap: "var(--rams-detail-space-1)",
          overflowWrap: "anywhere",
        }}
      >
        <span>
          {title} · {index + 1} of {total}
        </span>
        <span>
          {city} · {stock}
        </span>
      </figcaption>
    </figure>
  );
}

const controlRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap" as const,
  gap: "var(--rams-detail-space-1)",
};

export function CarouselDemo() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-wide)",
        display: "grid",
        gap: "var(--rams-detail-space-1)",
      }}
    >
      <h3>Print editions</h3>
      <Carousel aria-label="Five print editions" opts={{ loop: false }}>
        <CarouselContent>
          {editions.map((edition, index) => (
            <CarouselItem
              key={edition.title}
              aria-label={`${edition.title}, ${index + 1} of ${editions.length}`}
            >
              <EditionArtwork
                {...edition}
                index={index}
                total={editions.length}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div style={controlRowStyle}>
          <CarouselPrevious aria-label="Previous edition" />
          <CarouselNext aria-label="Next edition" />
        </div>
      </Carousel>
    </section>
  );
}

export function CarouselSize() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-full)",
        display: "grid",
        gap: "var(--rams-detail-space-1)",
      }}
    >
      <h3>Print editions · partial slides</h3>
      <Carousel
        aria-label="Print editions with partial next slides"
        opts={{ align: "start", loop: false }}
      >
        <CarouselContent style={{ alignItems: "stretch" }}>
          {editions.map((edition, index) => (
            <CarouselItem
              key={edition.title}
              aria-label={`${edition.title}, ${index + 1} of ${editions.length}`}
              style={{
                flex: "0 0 var(--rams-detail-preview-carousel-partial-slide)",
                minWidth: 0,
              }}
            >
              <EditionArtwork
                {...edition}
                index={index}
                total={editions.length}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div style={controlRowStyle}>
          <CarouselPrevious aria-label="Previous edition" />
          <CarouselNext aria-label="Next edition" />
        </div>
      </Carousel>
    </section>
  );
}

export function CarouselOrientation() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-narrow)",
        display: "grid",
        gap: "var(--rams-detail-space-1)",
      }}
    >
      <h3>Vertical print editions</h3>
      <Carousel
        orientation="vertical"
        aria-label="Five print editions, vertical orientation"
        opts={{ loop: false }}
        style={{ width: "100%", height: "var(--rams-detail-preview-carousel-vertical-block)" }}
      >
        <CarouselContent>
          {editions.map((edition, index) => (
            <CarouselItem
              key={edition.title}
              aria-label={`${edition.title}, ${index + 1} of ${editions.length}`}
            >
              <EditionArtwork
                {...edition}
                index={index}
                total={editions.length}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div style={controlRowStyle}>
          <CarouselPrevious aria-label="Previous edition" />
          <CarouselNext aria-label="Next edition" />
        </div>
      </Carousel>
    </section>
  );
}

export function CarouselApiDemo() {
  const [api, setApi] = useState<CarouselApi>();
  const [position, setPosition] = useState<{
    current: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (!api) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      setPosition({
        current: api.selectedScrollSnap() + 1,
        total: api.scrollSnapList().length,
      });
    };

    updatePosition();
    api.on("select", updatePosition).on("reInit", updatePosition);
    return () => {
      api.off("select", updatePosition).off("reInit", updatePosition);
    };
  }, [api]);

  return (
    <section
      style={{
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-wide)",
        display: "grid",
        gap: "var(--rams-detail-space-1)",
      }}
    >
      <h3>Print edition position</h3>
      <Carousel
        aria-label="Print edition position example"
        opts={{ loop: false }}
        setApi={setApi}
      >
        <CarouselContent>
          {editions.map((edition, index) => (
            <CarouselItem
              key={edition.title}
              aria-label={`${edition.title}, ${index + 1} of ${editions.length}`}
            >
              <EditionArtwork
                {...edition}
                index={index}
                total={editions.length}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div style={controlRowStyle}>
          <CarouselPrevious aria-label="Previous edition" />
          <output

            aria-live="polite"
            style={{
              alignSelf: "center",
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontVariantNumeric: "var(--type-data-variant)",
            }}
          >
            {position ? `${position.current} / ${position.total}` : "—"}
          </output>
          <CarouselNext aria-label="Next edition" />
        </div>
      </Carousel>
    </section>
  );
}
