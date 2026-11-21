import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "../../primitives/sonner";
import { Button } from "../../primitives/button";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "../../primitives/item";
import { Empty, EmptyHeader, EmptyTitle } from "../../primitives/empty";
const layout = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1fr)",
  gap: "var(--rams-detail-preview-content-inset)",
  inlineSize: "100%",
  maxInlineSize: "var(--rams-detail-preview-measure-extra-wide)",
} as const;
function useFeedbackScope() {
  const scope = useId(),
    notice = scope + "-notice",
    typeNotice = scope + "-type",
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      toast.dismiss(notice);
      toast.dismiss(typeNotice);
    };
  }, [notice, typeNotice]);
  return { scope, notice, typeNotice, alive };
}
export function SonnerDemo() {
  const { scope, notice } = useFeedbackScope(),
    [archived, setArchived] = useState(false),
    action = useRef<HTMLButtonElement>(null);
  return (
    <section style={layout} aria-label="Edition tray">
      <Button
        ref={action}
        variant="outline"
        onClick={() => {
          const previous = archived;
          setArchived(!previous);
          toast(previous ? "Patio / 07 restored" : "Patio / 07 archived", {
            id: notice,
            toasterId: scope,
            duration: Infinity,
            description: previous
              ? "Returned to the edition tray."
              : "Removed from the edition tray.",
            action: {
              label: "Undo",
              onClick: () => {
                action.current?.focus({ preventScroll: true });
                setArchived(previous);
              },
            },
          });
        }}
      >
        {archived ? "Restore Patio / 07" : "Archive Patio / 07"}
      </Button>
      {archived ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle asChild>
              <h3>The tray is empty</h3>
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <Item>
          <ItemContent>
            <ItemTitle asChild>
              <h3>Patio / 07</h3>
            </ItemTitle>
            <ItemDescription>
              Rosario · Cotton stock · 48 sheets
            </ItemDescription>
          </ItemContent>
        </Item>
      )}
      <Toaster id={scope} closeButton containerAriaLabel="Edition feedback" />
    </section>
  );
}
export function SonnerTypes() {
  const { scope, notice, typeNotice, alive } = useFeedbackScope(),
    [kept, setKept] = useState(false),
    [reference, setReference] = useState(""),
    referenceAction = useRef<HTMLButtonElement>(null);
  const options = { id: notice, toasterId: scope, duration: Infinity };
  return (
    <section style={layout} aria-label="Print feedback types">
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--rams-detail-preview-element-gap)" }}>
        <Button
          variant="outline"
          onClick={() =>
            toast("Patio / 07", {
              ...options,
              description: "Rosario · Cotton stock · 48 sheets",
            })
          }
        >
          Edition details
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setKept(!kept);
            toast.success(kept ? "Proof released" : "Proof kept", {
              ...options,
              description: "Patio / 07",
            });
          }}
        >
          {kept ? "Release proof" : "Keep proof"}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.info("Packing note", {
              ...options,
              description: "Keep the grain parallel to the long edge.",
            })
          }
        >
          Packing note
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.warning("24 of 48 sheets available", {
              ...options,
              description: "The next run needs 24 more sheets.",
            })
          }
        >
          Check stock
        </Button>
        <Button
          ref={referenceAction}
          variant="outline"
          onClick={() =>
            reference
              ? toast.success("Reference ready", {
                  ...options,
                  description: reference,
                })
              : toast.error("Edition reference missing", {
                  ...options,
                  action: {
                    label: "Use PT-07",
                    onClick: () => {
                      referenceAction.current?.focus({ preventScroll: true });
                      setReference("PT-07");
                    },
                  },
                })
          }
        >
          Check reference
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            toast.promise(
              async () => {
                await document.fonts.ready;
                if (!alive.current) throw new Error("Type check cancelled");
                const css = getComputedStyle(document.body),
                  font = `${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
                if (!document.fonts.check(font))
                  throw new Error("The current font is unavailable");
                return "Current type is ready";
              },
              {
                ...options,
                id: typeNotice,
                loading: "Waiting for current type",
                success: (message) => message,
                error: (error) =>
                  error instanceof Error
                    ? error.message
                    : "Type could not be checked",
                finally: () => {
                  if (!alive.current) toast.dismiss(typeNotice);
                },
              },
            );
          }}
        >
          Check type
        </Button>
      </div>
      <Toaster id={scope} closeButton containerAriaLabel="Print feedback" />
    </section>
  );
}
