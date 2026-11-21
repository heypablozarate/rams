# Working with RAMS

If `installation.json` exists beside this file, this is an installed subset. Read that receipt,
`docs/foundations.md`, the attached local guides and actual component source. Its item IDs and
file list describe what is installed. Source-checkout commands below are not automatically present
in this subset; return to the source package before adding items. Do not invent local imports for
an optional guide example that the receipt does not list. Keep explicit project profiles outside
the package and this installed subtree.

1. Start with `llms.txt` and `docs/foundations.md`. Query `node tools/discover.mjs --query "<task>"`, then `--item <exact-id>`. Its generated index supplies attached guides, actual source exports/declarations and dependency versions. `rams.json` remains the file/hash authority; do not guess an item, import or API.
2. Read the component source before composing it. Preserve existing application data and APIs.
3. Run `node tools/install.mjs --target <app> --items <ids> --dry-run`; inspect the result before installing. Existing files with different bytes are conflicts, not permission to overwrite.
4. Import `src/rams/styles.css` once. Components use relative imports and native React props. Keep accessible labels, refs, keyboard behavior and validation associations.
5. Use Geist Sans for UI/body. Use Geist Serif 400 only for editorial display. Preserve fluid sizes and browser text enlargement; do not synthesize font styles.
6. Keep a single primary action per active view. A component card does not create a new view.
7. Verify the resulting application: compile, use keyboard and focus, exercise its actual states, and inspect narrow/wide layouts and reduced motion where applicable. Report checks performed and gaps explicitly.
8. Preserve license notices. Do not add services, telemetry, external assets or publishing actions that the user did not request.
9. Default to the public profile. An owner-supplied project profile requires explicit `--project` and `--profile` paths; read its authorized local rules and import its stylesheet after the core. Never infer identity, copy private assets into the source package or publish them. `docs/profiles.md` defines this boundary. Optional `palette.css` shares colors only.

For an authentication integration, read [Authentication in consuming applications](docs/authentication.md).
It composes the existing Button or a provider's own renderer; the text-only SignIn/LoginCentered
demonstrations remain local method records. Install the exact required items before using a recipe.
