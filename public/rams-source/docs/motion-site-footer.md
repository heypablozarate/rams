# Site footer

`SiteFooter` provides `columns`, `minimal`, and `logo` layouts. Columns pair navigation with an optional email form. Minimal uses quiet rows. Logo repeats the supplied brand name as decorative closing type with an intentional lower-edge fade; the ordinary readable brand remains above it. The decorative repeat uses container-relative type to fit the supplied short name, independently of body-text enlargement.

Supply `brand`, `tagline`, `columns`, `links`, `legal`, `socials`, and optional `status`. No operational status is invented by default. Href destinations are native links; destinations without an href call `onNavigate(link)` when provided and remain passive text otherwise. External links use a new tab with `noopener noreferrer`.

`newsletter={null}` hides the form. Otherwise `newsletter.onSubscribe(email)` receives a trimmed valid email and may return a promise. Resolution records the captured state; rejection keeps the email editable and shows a retryable error. No backend, mailing subscription, or delivery is implied by the component. The included example stores addresses in its visible local list. The captured state is one-shot for that mounted form.

Input errors are associated with the email field. The form focuses invalid input on submission and does not move focus after asynchronous completion. Labels and controls wrap as the available measure narrows without reducing the font size. `year` controls the copyright year.
