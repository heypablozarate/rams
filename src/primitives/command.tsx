"use client";
import * as React from "react";
import { Command as R } from "cmdk";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogCloseButton,
  type DialogContentProps,
} from "./dialog";
import { cx } from "./utils";
import { Input } from "./input";
import "./primitives.css";
import "./menus.css";
export const Command = React.forwardRef<
  React.ElementRef<typeof R>,
  React.ComponentPropsWithoutRef<typeof R>
>(function Command({ className, ...props }, ref) {
  return (
    <R
      {...props}
      ref={ref}
      className={cx("rams-command", className)}
      data-slot="command"
      data-rams-primitive="true"
    />
  );
});
export type CommandDialogProps = React.ComponentPropsWithoutRef<
  typeof Dialog
> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  trigger?: React.ReactElement;
  contentProps?: Omit<
    DialogContentProps,
    "children" | "className" | "showCloseButton" | "asChild"
  >;
};
export function CommandDialog({
  children,
  title = "Command palette",
  description = "Search available commands.",
  className,
  showCloseButton = true,
  trigger,
  contentProps,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        {...contentProps}
        {...(description ? {} : { "aria-describedby": undefined })}
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          contentProps?.onOpenAutoFocus?.(event);
          if (event.defaultPrevented) return;
          const input =
            event.target instanceof HTMLElement
              ? event.target.querySelector<HTMLInputElement>(
                  "[cmdk-input]:not(:disabled)",
                )
              : null;
          if (input) {
            event.preventDefault();
            input.focus();
          }
        }}
        className={cx("rams-command-dialog", className)}
      >
        <DialogHeader className="rams-command__header">
          <DialogTitle className="rams-command__title">{title}</DialogTitle>
          {showCloseButton && <DialogCloseButton />}
          {description && (
            <DialogDescription className="rams-menu__sr">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <Command label={title}>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}
export const CommandInput = React.forwardRef<
  React.ElementRef<typeof R.Input>,
  React.ComponentPropsWithoutRef<typeof R.Input>
>(function CommandInput(
  { asChild = false, children, className, ...props },
  ref,
) {
  const child = (asChild ? React.Children.only(children) : <Input />) as React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>;
  const labelledBy = child.props["aria-labelledby"] ?? props["aria-labelledby"];
  const label = child.props["aria-label"] ?? props["aria-label"];
  const naming = labelledBy !== undefined ? { "aria-labelledby": labelledBy } : label !== undefined ? { "aria-labelledby": undefined, "aria-label": label } : {};
  return (
    <div className="rams-command__input-wrap">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="var(--rams-detail-field-search-glyph-stroke)" />
        <path
          d="m14.5 14.5 5 5"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-field-search-glyph-stroke)"
          strokeLinecap="round"
        />
      </svg>
      <R.Input
        {...props}
        ref={ref}
        asChild
        className={cx("rams-command__input", className)}
        data-slot="command-input"
        data-rams-primitive="true"
      >
        {React.cloneElement(child, naming)}
      </R.Input>
    </div>
  );
});
export const CommandList = React.forwardRef<
  React.ElementRef<typeof R.List>,
  React.ComponentPropsWithoutRef<typeof R.List>
>(function CommandList({ className, ...props }, ref) {
  return (
    <R.List
      {...props}
      ref={ref}
      className={cx("rams-command__list", className)}
      data-slot="command-list"
    />
  );
});
export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof R.Empty>,
  React.ComponentPropsWithoutRef<typeof R.Empty>
>(function CommandEmpty({ className, ...props }, ref) {
  return (
    <R.Empty
      {...props}
      ref={ref}
      className={cx("rams-command__empty", className)}
      data-slot="command-empty"
    />
  );
});
export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof R.Group>,
  React.ComponentPropsWithoutRef<typeof R.Group>
>(function CommandGroup({ className, ...props }, ref) {
  return (
    <R.Group
      {...props}
      ref={ref}
      className={cx("rams-command__group", className)}
      data-slot="command-group"
    />
  );
});
export const CommandItem = React.forwardRef<
  React.ElementRef<typeof R.Item>,
  React.ComponentPropsWithoutRef<typeof R.Item>
>(function CommandItem({ className, ...props }, ref) {
  return (
    <R.Item
      {...props}
      ref={ref}
      className={cx("rams-command__item", className)}
      data-slot="command-item"
      data-rams-primitive="true"
    />
  );
});
export const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof R.Separator>,
  React.ComponentPropsWithoutRef<typeof R.Separator>
>(function CommandSeparator({ className, ...props }, ref) {
  return (
    <R.Separator
      {...props}
      ref={ref}
      className={cx("rams-menu__separator", className)}
      data-slot="command-separator"
    />
  );
});
export const CommandShortcut = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(function CommandShortcut({ className, ...props }, ref) {
  return (
    <span
      {...props}
      ref={ref}
      className={cx("rams-menu__shortcut", className)}
      data-slot="command-shortcut"
    />
  );
});
