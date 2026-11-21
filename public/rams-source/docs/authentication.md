# Authentication in consuming applications

The SignIn and LoginCentered demonstrations use provider names as text, without logos,
ordinal markers or empty artwork placeholders. Their `onSignIn` callbacks synchronously
record an illustrative method locally. They do not call a provider SDK, await authentication,
create a session or establish identity. Keep those examples separate from a real access flow.

## Compose an application-owned action

Use a provider's official SDK and its supported renderer when implementing real authentication.
If that integration permits an application-owned button, the existing RAMS `Button` accepts
React content through `children` and a native `onClick` handler. No icon-specific RAMS prop
or additional component is needed.

Install the `button` item first and import `src/rams/styles.css` once in the application.
The following example belongs to your application at `src/auth/ProviderAction.tsx`, outside
the installed RAMS subtree. `ProviderActionProps` is defined here; it is not a RAMS export.

```tsx
import type { ReactNode } from "react";
import { Button } from "../rams/components/button";

type ProviderActionProps = {
  label: string;
  onStart: () => void;
  officialMark?: ReactNode;
};

export function ProviderAction({ label, onStart, officialMark }: ProviderActionProps) {
  return (
    <Button type="button" variant="outline" onClick={onStart}>
      {officialMark != null && (
        <span aria-hidden="true" style={{ display: "inline-flex", flex: "none" }}>
          {officialMark}
        </span>
      )}
      <span>{label}</span>
    </Button>
  );
}
```

Omit `officialMark` for a text-only action. There is no reserved mark node in that case.
For a permitted branded implementation, the consuming application supplies the official
artwork as a decorative, non-focusable React node, along with the required visible label.
RAMS supplies no provider artwork or credential configuration in this recipe.

`onStart` must be supplied by the application and delegate to its actual authentication
integration. This wrapper only forwards the click. The application owns SDK initialization,
asynchronous results, errors, pending controls and the session; a click or callback return
does not prove authentication. Use the existing Button's native `disabled` prop when the
real application state requires it. Never replace the demonstration's local `onSignIn`
callback with an assumed OAuth SDK interface.

## Respect the provider renderer

A provider may require its own button renderer, typography, wording, artwork, spacing or
other integration conditions. The generic composition above does not establish Google,
Apple or another provider's compliance. Use the required SDK renderer directly when needed;
do not wrap an interactive SDK-rendered button inside another Button. Keep the text-only
demonstrations unchanged when adding a separate application integration.

Verify the consuming view's keyboard activation, accessible name, focus, actual pending/error
recovery, narrow layout and enlarged text with the chosen integration. Keep credentials and
session enforcement in the application's authentication boundary, not in demonstration code.

## Official integration references

* [Google Identity Services button](https://developers.google.com/identity/gsi/web/guides/display-button)
* [Sign in with Apple on other platforms](https://developer.apple.com/documentation/signinwithapple/incorporating-sign-in-with-apple-into-other-platforms)
* [Authorizing GitHub OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
