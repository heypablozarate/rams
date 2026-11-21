# Explicit project profiles

The package defaults to Geist and neutral rules. The authored Brand website is a separate work;
its personal identity rules and proprietary assets are not forked into this package.
`palette.css` contains only the separately shareable color roles and is optional.

An owner can keep additional rules and styles in their own project, outside this source package.
Create a private, ignored `.rams-private/profile.json` in that project:

```json rams-project-profile
{
  "schemaVersion": 1,
  "kind": "project",
  "rules": ["./guidelines.md"],
  "stylesheets": ["./identity.css"]
}
```

Both referenced files must exist inside the selected project and outside the source package.
Rules are Markdown/text; stylesheets are CSS. Local relative paths resolve from the profile file.
Do not put credentials in a profile. Keep private files outside a public repository and its artifacts;
an ignored file can still be copied accidentally, so inspect the export boundary too.

```sh
node tools/discover.mjs --item button --project /path/to/app --profile .rams-private/profile.json
```

The result reports the explicit rule/stylesheet paths; it does not copy their contents into the
package, rewrite them, load fonts or automatically edit the application. Read the authorized project
rules, import the chosen stylesheet after the base styles, and verify the actual result. Assets need
their own licensing and delivery checks. A stylesheet URL served by a public website is fetchable;
its origin being private does not make browser-delivered bytes secret.

Shared interaction and accessibility rules remain applicable. Explicit project typography/identity
choices override the default visual choices for that project only; they do not change the public core.

Do not infer a profile from a person's name, repository author or machine paths. Without both
`--project` and `--profile`, discovery stays in the default profile even if private files exist.
The installer always copies only public manifest files. There is no personal-asset installation item.
The installed receipt's `profile: "default"` describes that source payload, not the application's
active visual configuration. An authorized project overlay remains separate. Keep its explicit
selection in the project's own agent instructions so a later agent does not infer identity or
mistake the package baseline for permission to remove the local overlay.
