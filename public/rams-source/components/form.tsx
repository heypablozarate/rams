"use client";
import * as React from "react";
import { Slot } from "radix-ui";
import {
  Controller,
  FormProvider,
  type ControllerProps,
  type ControllerFieldState,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Label } from "./label";
import { cx } from "./utils";
import "./primitives.css";
import "./forms.css";

export const Form = FormProvider;
type Part = "description" | "message";
type FieldBridge = ControllerFieldState & {
  name: string;
  id: string;
  control: string;
  description?: string;
  message?: string;
  register: (part: Part, id: string) => () => void;
};
const Bridge = React.createContext<FieldBridge | null>(null);
function useBridge() {
  const field = React.useContext(Bridge);
  if (!field) throw new Error("Form parts must be rendered inside FormField.");
  return field;
}
/** Metadata is owned by the Controller instance, rather than a second form subscription. */
export function FormField<
  T extends FieldValues = FieldValues,
  N extends FieldPath<T> = FieldPath<T>,
>({
  render,
  controlId,
  ...props
}: ControllerProps<T, N> & { controlId?: string }) {
  const id = React.useId();
  const [parts, setParts] = React.useState<Partial<Record<Part, string>>>({});
  const register = React.useCallback((part: Part, partId: string) => {
    setParts((previous) =>
      previous[part] === partId ? previous : { ...previous, [part]: partId },
    );
    return () =>
      setParts((previous) =>
        previous[part] === partId
          ? { ...previous, [part]: undefined }
          : previous,
      );
  }, []);
  return (
    <Controller
      {...props}
      render={(controller) => (
        <Bridge.Provider
          value={{
            ...controller.fieldState,
            name: props.name,
            id,
            control: controlId ?? id + "-control",
            description: parts.description,
            message: parts.message,
            register,
          }}
        >
          {render(controller)}
        </Bridge.Provider>
      )}
    />
  );
}
export function useFormField() {
  const field = useBridge();
  return {
    id: field.id,
    name: field.name,
    invalid: field.invalid,
    isDirty: field.isDirty,
    isTouched: field.isTouched,
    isValidating: field.isValidating,
    error: field.error,
    formItemId: field.control,
    formDescriptionId: field.description ?? field.id + "-description",
    formMessageId: field.message ?? field.id + "-message",
  };
}
export const FormItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function FormItem({ className, ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className={cx("rams-form-item", className)}
      data-rams-primitive="true"
      data-slot="form-item"
    />
  );
});
export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof Label>
>(function FormLabel({ className, htmlFor, ...props }, ref) {
  const field = useBridge();
  return (
    <Label
      {...props}
      ref={ref}
      htmlFor={htmlFor ?? field.control}
      className={cx("rams-form-label", className)}
      data-invalid={field.invalid || undefined}
    />
  );
});

type ControlChild = React.ReactElement<{
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
}>;
export type FormControlProps = Omit<
  React.ComponentPropsWithoutRef<typeof Slot.Root>,
  "children" | "id"
> & { children: ControlChild };
export const FormControl = React.forwardRef<HTMLElement, FormControlProps>(
  function FormControl(
    {
      children,
      "aria-describedby": describedBy,
      "aria-invalid": invalid,
      ...props
    },
    ref,
  ) {
    const field = useBridge(),
      child = React.Children.only(children),
      controlId = field.control;
    if (child.props.id && child.props.id !== controlId)
      throw new Error(
        "Set controlId on FormField to customize its control ID.",
      );
    const description =
      [
        ...new Set(
          [
            describedBy,
            child.props["aria-describedby"],
            field.description,
            field.message,
          ]
            .filter(Boolean)
            .flatMap((value) => value!.split(/\s+/))
            .filter(Boolean),
        ),
      ].join(" ") || undefined;
    const childProps = {
      id: controlId,
      "aria-describedby": description,
      "aria-invalid": field.invalid
        ? true
        : (child.props["aria-invalid"] ?? invalid),
    };
    return (
      <Slot.Root {...props} {...childProps} ref={ref}>
        {React.cloneElement(child, childProps)}
      </Slot.Root>
    );
  },
);
function hasContent(value: React.ReactNode) {
  return (
    value !== undefined && value !== null && value !== false && value !== ""
  );
}
export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(function FormDescription({ id, children, className, ...props }, ref) {
  const field = useBridge(),
    descriptionId = id ?? field.id + "-description",
    present = hasContent(children);
  React.useLayoutEffect(
    () => (present ? field.register("description", descriptionId) : undefined),
    [field.register, descriptionId, present],
  );
  return present ? (
    <p
      {...props}
      ref={ref}
      id={descriptionId}
      className={cx("rams-form-description", className)}
      data-rams-primitive="true"
      data-slot="form-description"
    >
      {children}
    </p>
  ) : null;
});
export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(function FormMessage(
  { id, children, className, role = "alert", ...props },
  ref,
) {
  const field = useBridge(),
    messageId = id ?? field.id + "-message",
    body = field.error?.message || children,
    present = hasContent(body);
  React.useLayoutEffect(
    () => (present ? field.register("message", messageId) : undefined),
    [field.register, messageId, present],
  );
  return present ? (
    <p
      {...props}
      ref={ref}
      id={messageId}
      role={role}
      className={cx("rams-form-message", className)}
      data-rams-primitive="true"
      data-slot="form-message"
    >
      {body}
    </p>
  ) : null;
});
