import { useLayoutEffect, useRef, useState } from "react";
import * as P from "../../primitives/pagination";
const editionNames = [
  "Terrace",
  "Barranca",
  "Patio",
  "River grid",
  "Trama",
  "Delta",
  "Sur",
  "Río",
  "Galería",
  "Umbral",
  "Vereda",
  "Pliegue",
  "Litoral",
  "Pampa",
  "Costanera",
  "Ceibo",
];
const editions = editionNames.map((title, index) => ({
  number: index + 1,
  title: title + " / " + String(index + 1).padStart(2, "0"),
}));
export function PaginationDemo() {
  const [page, setPage] = useState(2),
    current = useRef<HTMLButtonElement>(null),
    pending = useRef(false),
    pages = Math.ceil(editions.length / 2),
    start = Math.max(1, Math.min(page - 1, pages - 2)),
    numbers = [start, start + 1, start + 2];
  useLayoutEffect(() => {
    if (pending.current) {
      current.current?.focus({ preventScroll: true });
      pending.current = false;
    }
  }, [page]);
  function move(next: number, edge = false) {
    pending.current = edge;
    setPage(Math.max(1, Math.min(pages, next)));
  }
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-full)",
        display: "grid",
        gap: "var(--rams-detail-space-5)",
      }}
      aria-label="Edition register"
    >
      <ul>
        {editions.slice((page - 1) * 2, page * 2).map((edition) => (
          <li key={edition.number}>{edition.title}</li>
        ))}
      </ul>
      <P.Pagination aria-label="Edition pages">
        <P.PaginationContent>
          <P.PaginationItem>
            <P.PaginationPrevious asChild>
              <button
                type="button"
                disabled={page === 1}
                onClick={() => move(page - 1, page === 2)}
              >
                Previous
              </button>
            </P.PaginationPrevious>
          </P.PaginationItem>
          {start > 1 && (
            <P.PaginationItem>
              <P.PaginationEllipsis />
            </P.PaginationItem>
          )}
          {numbers.map((number) => (
            <P.PaginationItem key={number}>
              <P.PaginationLink asChild isActive={page === number}>
                <button
                  ref={page === number ? current : undefined}
                  type="button"
                  aria-label={"Page " + number}
                  onClick={() => move(number)}
                >
                  {number}
                </button>
              </P.PaginationLink>
            </P.PaginationItem>
          ))}
          {numbers.at(-1)! < pages && (
            <P.PaginationItem>
              <P.PaginationEllipsis />
            </P.PaginationItem>
          )}
          <P.PaginationItem>
            <P.PaginationNext asChild>
              <button
                type="button"
                disabled={page === pages}
                onClick={() => move(page + 1, page === pages - 1)}
              >
                Next
              </button>
            </P.PaginationNext>
          </P.PaginationItem>
        </P.PaginationContent>
      </P.Pagination>
      <p >
        Page {page} of {pages}
      </p>
    </section>
  );
}
