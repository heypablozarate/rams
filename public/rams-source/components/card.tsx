"use client";

import * as React from "react";
import "./primitives.css";
import { cx } from "./utils";

type DivProps = React.ComponentPropsWithoutRef<"div">;

function cardPart<T extends HTMLDivElement>(slot: string, className: string) {
  return React.forwardRef<T, DivProps>(function CardPart({ className: extra, ...props }, ref) {
    return (
      <div
        {...props}
        ref={ref}
        className={cx(className, extra)}
        data-rams-primitive="true"
        data-slot={slot}
      />
    );
  });
}

export const Card = cardPart<HTMLDivElement>("card", "rams-card");
export const CardHeader = cardPart<HTMLDivElement>("card-header", "rams-card__header");
export const CardTitle = cardPart<HTMLDivElement>("card-title", "rams-card__title");
export const CardDescription = cardPart<HTMLDivElement>("card-description", "rams-card__description");
export const CardAction = cardPart<HTMLDivElement>("card-action", "rams-card__action");
export const CardContent = cardPart<HTMLDivElement>("card-content", "rams-card__content");
export const CardFooter = cardPart<HTMLDivElement>("card-footer", "rams-card__footer");

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardAction.displayName = "CardAction";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";
