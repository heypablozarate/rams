"use client";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/button";
import { Textarea } from "../components/textarea";
import { Label } from "../components/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "../components/carousel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "../components/resizable";
import { Toaster } from "../components/sonner";
import { editionWallStackQuery } from "../components/edition-wall-query";
import { useMediaQuery } from "../components/use-media-query";
import { editionWallPanels } from "../components/edition-wall-panels";
import "./edition-wall.css";
const covers = [
  { id: "barranca", title: "Barranca / 21", city: "Rosario", shape: "circle" },
  { id: "pliegue", title: "Pliegue / 22", city: "Tucumán", shape: "lines" },
  { id: "patio", title: "Patio / 23", city: "Mendoza", shape: "square" },
];
export function EditionWall() {
  const id = useId(),
    stacked = useMediaQuery(editionWallStackQuery);
  const [api, setApi] = useState<CarouselApi>(),
    [index, setIndex] = useState(0),
    [kept, setKept] = useState<string[]>([]),
    [note, setNote] = useState("");
  useEffect(() => {
    if (!api) return;
    const update = () => setIndex(api.selectedScrollSnap());
    update();
    api.on("select", update).on("reInit", update);
    return () => {
      api.off("select", update).off("reInit", update);
    };
  }, [api]);
  const current = covers[index] ?? covers[0];
  function keep() {
    if (kept.includes(current.id)) return;
    setKept((previous) => [...previous, current.id]);
    toast.success(current.title + " kept", {
      id: "keep-" + current.id,
      duration: Infinity,
      description: "Added to the inspection list.",
      action: {
        label: "Undo",
        onClick: () =>
          setKept((previous) =>
            previous.filter((value) => value !== current.id),
          ),
      },
    });
  }
  return (
    <main className="edition-wall">
      <header>
        <p>Sur Print Archive · Cover review</p>
        <h1 className="rams-editorial-title">
          Three covers, one inspection desk
        </h1>
      </header>
      <div className="wall-panels">
        <ResizablePanelGroup
          orientation={stacked ? "vertical" : "horizontal"}
          id={id + "-panels"}
        >
          <ResizablePanel
            id={id + "-artwork"}
            defaultSize={editionWallPanels.artDefault}
            minSize={editionWallPanels.artMinimum}
            style={{ overflow: "auto" }}
          >
            <section className="wall-artwork" aria-label="Cover inspection">
              <Carousel aria-label="Edition cover gallery" setApi={setApi}>
                <CarouselContent>
                  {covers.map((cover, i) => (
                    <CarouselItem
                      key={cover.id}
                      aria-label={`${i + 1} of ${covers.length} · ${cover.title}`}
                    >
                      <figure>
                        <svg viewBox="0 0 400 300" aria-hidden="true">
                          <rect
                            x="12"
                            y="12"
                            width="376"
                            height="276"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          {cover.shape === "circle" ? (
                            <>
                              <circle
                                cx="200"
                                cy="150"
                                r="95"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="24"
                              />
                              <path
                                d="M40 150h320"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </>
                          ) : cover.shape === "lines" ? (
                            <path
                              d="M70 50v200m65-200v200m65-200v200m65-200v200m65-200v200"
                              stroke="currentColor"
                              strokeWidth="26"
                            />
                          ) : (
                            <>
                              <rect
                                x="100"
                                y="50"
                                width="200"
                                height="200"
                                fill="currentColor"
                              />
                              <rect
                                x="140"
                                y="90"
                                width="120"
                                height="120"
                                fill="var(--rams-surface)"
                              />
                            </>
                          )}
                        </svg>
                        <figcaption>
                          <strong>{cover.title}</strong>
                          <span>{cover.city}</span>
                        </figcaption>
                      </figure>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="wall-controls">
                  <CarouselPrevious />
                  <CarouselNext />
                  <span aria-live="polite" aria-atomic="true">
                    {index + 1} of {covers.length}
                  </span>
                </div>
              </Carousel>
              <Button
                className="wall-keep"
                onClick={keep}
                disabled={kept.includes(current.id)}
              >
                {kept.includes(current.id)
                  ? "Kept for inspection"
                  : "Keep selected cover"}
              </Button>
            </section>
          </ResizablePanel>
          <ResizableHandle withHandle aria-label="Resize inspection areas" />
          <ResizablePanel
            id={id + "-notes"}
            defaultSize={editionWallPanels.notesDefault}
            minSize={editionWallPanels.notesMinimum}
            style={{ overflow: "auto" }}
          >
            <section className="wall-notes" aria-label="Inspection list">
              <h2>Inspection list</h2>
              {kept.length ? (
                <ul>
                  {kept.map((value) => (
                    <li key={value}>
                      {covers.find((cover) => cover.id === value)?.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Choose a cover and keep it for review.</p>
              )}
              <Label htmlFor={id + "-note"}>Inspection note</Label>
              <Textarea
                id={id + "-note"}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Paper, trim or ink adjustments"
              />
            </section>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Toaster closeButton containerAriaLabel="Edition notifications" />
    </main>
  );
}
