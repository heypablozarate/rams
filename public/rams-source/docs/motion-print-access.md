# Reader-access UI examples

These are illustrative UI state machines. Local fixed-code comparison and `onSignIn` callbacks are not authentication or proof of identity. Connect and enforce real access control in the consuming application and its services. No provider, passkey, email or account service is supplied by these examples.

SignIn and LoginCentered use provider names as text, without logos or ordinal placeholders.
Their optional `onSignIn` callbacks are synchronous local records, not asynchronous SDK entry
points or loading-state APIs. For a separate real integration, read [Authentication in consuming applications](authentication.md).

## Reader register

`SignupForm` accepts `onSubmit(details)`, `serverError` and optional `onProvider(provider)`. `SignupDetails` contains name/email/password/productUpdates. Required validation identifies the first invalid field. A valid submission awaits only the caller's actual optional promise; rejection preserves fields and shows the error. The example keeps name/email/edition-notes choice in a local list and rejects duplicate addresses; passwords are not stored in that list.

Connected provider controls delegate their route to the supplied void callback; no identity or successful registration is synthesized. The section is omitted without a handler. Reset returns to editable details. Async completion/unmount/outside interaction invalidate pending focus intent.

## Returning reader

`SignIn` accepts `demoCode` and `onSignIn(account,method)`. `SignInAccount` retains name/email/photo? shape; defaults use a generic print-reader label without a portrait. Enter an address, compare six local digits, or record a chosen passkey/provider method for that address. Wrong codes and thrown callbacks preserve a recoverable state. Restart clears code/errors immediately; no artificial cooldown or delivery state exists. Reset returns to address entry.

## Centered reading room

`LoginCentered` accepts `demoCode`, `demoEmail`, `fullScreen`, `termsHref`, `privacyHref`, `onSignIn(email,method,mode)` and `className`. New/returning mode travels with the local callback record. The explicit illustrative address is used for method choices; email-code comparison uses the entered address. Omitted legal destinations use the existing local disclosures; the example also preserves its local terms/privacy text. Supplied legal destinations remain caller-owned native href links.

All three use real RAMS inputs/buttons and owned step regions. Outgoing controls become inert during exit. Height motion has one cancellable owner, live reduced motion resolves immediately, and focus returns only while owned. `fullScreen` is an opt-in viewport minimum, not a fixed clipped card. Use actual labels and natural button height; do not shrink fonts to fit a long action.
