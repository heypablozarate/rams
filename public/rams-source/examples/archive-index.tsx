"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import * as B from "../components/breadcrumb";
import * as P from "../components/pagination";
import * as G from "../components/button-group";
import * as I from "../components/item";
import * as E from "../components/empty";
import { Avatar, AvatarImage, AvatarFallback } from "../components/avatar";
import { printPreviewGeometry } from "../components/print-preview-geometry";
import { ScrollArea } from "../components/scroll-area";
import "./archive-index.css";
const editions = [
  { id: "delta", title: "Delta / 08", place: "Rosario", stock: "Cotton stock" },
  {
    id: "barranca",
    title: "Barranca / 09",
    place: "Paraná",
    stock: "Uncoated stock",
  },
  {
    id: "patio",
    title: "Patio / 10",
    place: "Santa Fe",
    stock: "Recycled stock",
  },
  { id: "trama", title: "Trama / 11", place: "Córdoba", stock: "Linen stock" },
  { id: "sur", title: "Sur / 12", place: "La Plata", stock: "Cotton stock" },
  {
    id: "rio",
    title: "Río / 13",
    place: "Buenos Aires",
    stock: "Recycled stock",
  },
];
const archivePaint = printPreviewGeometry.encodedArtwork.archiveCover;
const printImage =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${archivePaint.paper}"/><path d="M8 48 48 8M16 56 56 16M8 32 32 8M32 56 56 32" stroke="${archivePaint.ink}" stroke-width="${archivePaint.strokeWidth}"/></svg>`,
  );
export function ArchiveIndex() {
  const [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState<string | null>(null),
    [archived, setArchived] = useState<string[]>([]);
  const filterRef = useRef<HTMLInputElement>(null),
    indexHeading = useRef<HTMLHeadingElement>(null),
    detailHeading = useRef<HTMLHeadingElement>(null),
    previousView = useRef<string | null>(null),
    openButtons = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => {
    if (previousView.current !== selected) {
      (selected
        ? detailHeading.current
        : (openButtons.current.get(previousView.current ?? "") ??
          filterRef.current ??
          indexHeading.current)
      )?.focus();
      previousView.current = selected;
    }
  }, [selected]);
  const filtered = editions.filter((x) =>
      (x.title + " " + x.place + " " + x.stock)
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
    pages = Math.max(1, Math.ceil(filtered.length / 2)),
    current = Math.min(page, pages),
    visible = filtered.slice((current - 1) * 2, current * 2),
    edition = editions.find((x) => x.id === selected);
  function clear() {
    setQuery("");
    setPage(1);
    filterRef.current?.focus();
  }
  return (
    <main className="archive-index">
      <header>
        <p>Sur Print Archive · Edition index</p>
        <h1 ref={indexHeading} tabIndex={-1} className="rams-editorial-title">
          A place for every proof.
        </h1>
      </header>
      <B.Breadcrumb>
        <B.BreadcrumbList>
          <B.BreadcrumbItem>
            {edition ? (
              <B.BreadcrumbLink asChild>
                <button type="button" onClick={() => setSelected(null)}>
                  Edition index
                </button>
              </B.BreadcrumbLink>
            ) : (
              <B.BreadcrumbPage>Edition index</B.BreadcrumbPage>
            )}
          </B.BreadcrumbItem>
          {edition && (
            <>
              <B.BreadcrumbSeparator />
              <B.BreadcrumbItem>
                <B.BreadcrumbPage>{edition.title}</B.BreadcrumbPage>
              </B.BreadcrumbItem>
            </>
          )}
        </B.BreadcrumbList>
      </B.Breadcrumb>
      {edition ? (
        <section aria-label="Edition record" className="archive-index-detail">
          <h2 ref={detailHeading} tabIndex={-1}>
            {edition.title}
          </h2>
          <p>
            {edition.place} · {edition.stock}
          </p>
          <p role="status">
            {archived.includes(edition.id) ? "Archived" : "On desk"}
          </p>
          <G.ButtonGroup orientation="vertical" aria-label="Edition actions">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setArchived((ids) =>
                  ids.includes(edition.id)
                    ? ids.filter((id) => id !== edition.id)
                    : [...ids, edition.id],
                )
              }
            >
              {archived.includes(edition.id)
                ? "Return to desk"
                : "Archive proof"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelected(null)}
            >
              Back to index
            </Button>
          </G.ButtonGroup>
        </section>
      ) : (
        <>
          <div className="archive-index-filter">
            <Label htmlFor="edition-filter">Find an edition</Label>
            <Input
              ref={filterRef}
              id="edition-filter"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
            <p role="status">
              {filtered.length} {filtered.length === 1 ? "edition" : "editions"}
            </p>
          </div>
          {filtered.length ? (
            <>
              <I.ItemGroup aria-label="Edition results">
                {visible.map((x) => (
                  <I.Item variant="outline" key={x.id}>
                    <I.ItemMedia>
                      <Avatar>
                        <AvatarImage src={printImage} alt="" />
                        <AvatarFallback>{x.title.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    </I.ItemMedia>
                    <I.ItemContent>
                      <I.ItemTitle asChild>
                        <h2>{x.title}</h2>
                      </I.ItemTitle>
                      <I.ItemDescription>
                        {x.place} · {x.stock}
                      </I.ItemDescription>
                    </I.ItemContent>
                    <I.ItemActions>
                      <Button
                        ref={(node) => {
                          if (node) openButtons.current.set(x.id, node);
                          else openButtons.current.delete(x.id);
                        }}
                        type="button"
                        variant="outline"
                        aria-label={"Open " + x.title}
                        onClick={() => setSelected(x.id)}
                      >
                        Open proof
                      </Button>
                    </I.ItemActions>
                  </I.Item>
                ))}
              </I.ItemGroup>
              <P.Pagination aria-label="Edition pages">
                <P.PaginationContent>
                  <P.PaginationItem>
                    <P.PaginationPrevious asChild>
                      <button
                        type="button"
                        disabled={current === 1}
                        onClick={() => setPage((n) => n - 1)}
                      >
                        Previous
                      </button>
                    </P.PaginationPrevious>
                  </P.PaginationItem>
                  {Array.from({ length: pages }, (_, i) => (
                    <P.PaginationItem key={i}>
                      <P.PaginationLink asChild isActive={current === i + 1}>
                        <button
                          type="button"
                          aria-label={"Page " + (i + 1)}
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </P.PaginationLink>
                    </P.PaginationItem>
                  ))}
                  <P.PaginationItem>
                    <P.PaginationNext asChild>
                      <button
                        type="button"
                        disabled={current === pages}
                        onClick={() => setPage((n) => n + 1)}
                      >
                        Next
                      </button>
                    </P.PaginationNext>
                  </P.PaginationItem>
                </P.PaginationContent>
              </P.Pagination>
            </>
          ) : (
            <E.Empty>
              <E.EmptyHeader>
                <E.EmptyTitle asChild>
                  <h2>No matching editions</h2>
                </E.EmptyTitle>
                <E.EmptyDescription>
                  Search by title, city or paper stock.
                </E.EmptyDescription>
              </E.EmptyHeader>
              <E.EmptyContent>
                <Button type="button" variant="outline" onClick={clear}>
                  Clear search
                </Button>
              </E.EmptyContent>
            </E.Empty>
          )}
          <section
            className="archive-index-strip"
            aria-label="Print collection"
          >
            <h2>The complete collection</h2>
            <ScrollArea
              scrollbars="horizontal"
              style={{ height: "var(--rams-detail-example-archive-index-scroll-height)" }}
              viewportProps={{ "aria-label": "Print collection strip" }}
            >
              <div className="archive-index-covers">
                {editions.map((x, i) => (
                  <div className="archive-index-cover" key={x.id}>
                    <strong>{String(i + 8).padStart(2, "0")}</strong>
                    <span>{x.title}</span>
                    <span>{x.place}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </section>
        </>
      )}
    </main>
  );
}
