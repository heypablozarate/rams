# Fields and forms

Field supplies layout; FieldSet and FieldLegend use the native grouping elements. The legend's label variant changes its style, not its semantics. A responsive Field stacks when its FieldGroup falls below the shared form container breakpoint. Associate labels, help and errors with the actual input. FieldError renders explicit children or unique nonempty messages; it renders nothing when there is no error.

InputGroup composes the same Input, Textarea and Button primitives used elsewhere. Addons can sit at either inline edge or above/below the control. Clicking a noninteractive addon focuses the enabled control; a nested button/link or a prevented click keeps its own behavior. Give action buttons an accessible name. The group supplies the outer surface/focus outline; do not add a second input frame. The control reserves a font-relative minimum width, capped by the group; inline addons move to another row when their combined width no longer fits. A lone inline action uses its Button inset, while text addons and block addons retain their own padding.

The group's frame uses `--rams-detail-primitive-border-width`. The nested action radius and the available input height account for that same border. Keep each addon's semantic alignment when wrapping.

Form is React Hook Form's provider, not an HTML form. Supply the form element and validation rules. FormField owns the Controller and its stable ID. FormControl composes one child that forwards native props and refs. FormLabel, FormDescription and FormMessage share its metadata. Only mounted help/error parts are added to aria-describedby; external describedby IDs are preserved.

For a custom ID, set `controlId` on FormField. Do not set a different ID on its FormControl child. This keeps label/control identity consistent during server rendering and hydration. Use at most one FormDescription and one FormMessage per FormField; combine additional help/error text within that part. A Select or Checkbox must receive the Controller's ref on its actual focusable control, not just its outer provider.

The [Dispatch Proof](../examples/dispatch-proof.tsx) validates a local packing slip, focuses the first invalid control, and stores the successful record separately from its draft. Reset draft preserves the prepared slip and focuses the title. It does not send a shipment or call a service.
