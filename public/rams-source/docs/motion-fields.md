# Motion fields

These optional fields compose the same RAMS primitives as the base controls. They add animated values, helper/error copy or an elastic thumb; their labels, native editing and focus remain part of the underlying control.

Install `motion-input`, `motion-textarea`, `motion-select`, `motion-switch` or `motion-password-field` with `tools/install.mjs`. Use its package list and a bundler that supports CSS Modules. Import `./rams/styles.css` once. The compact field examples use shared measure and stack gap roles so the control and its result reflow together.

- motion-input exports Input. It accepts native input props plus label, description and error. Keep a stable id or let the field generate one; supplied help and errors are associated with the input.
- motion-textarea exports Textarea with the equivalent native textarea props, label, description and error. The consuming form owns limits and validation.
- motion-select exports Select. Supply label, options, value/onValueChange and optional description. It composes RAMS Select parts and retains native popup focus/keyboard behavior.
- motion-switch exports Switch with the base RAMS Switch props plus an optional external label. Only the thumb's response changes. Keep checked/onCheckedChange for controlled state.
- motion-password-field exports PasswordField. It retains native input props and value while reveal changes the type. label and description identify the field; messages can override Show password and Hide password.

System reduced motion is read live. Keep error text useful and do not use animation to communicate an otherwise hidden requirement. Use the base controls when the motion does not help the task.

The motion-field implementations retain adapted ARC code under MIT; licenses/ARC-LICENSE.txt and NOTICE.md preserve its attribution. The RAMS primitives, original print-room examples and installation tools retain their own MIT notice.
