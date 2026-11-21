# Install RAMS in an application

Paste this into a coding agent in your React project. Mention the components you want or what you are building.

```text
Install RAMS components in the React application I'm working on. Use the component names or interface goal from this conversation. If the app or goal is unclear, ask me only for the missing detail.

Find the app root by checking its package.json. Use an existing checkout of https://github.com/heypablozarate/rams, or clone that repository outside the app. Do not download a ZIP. If GitHub access fails, stop and report the error.

In the checkout, read public/rams-source/llms.txt, AGENTS.md and docs/foundations.md under public/rams-source. From the repository root, use node public/rams-source/tools/discover.mjs with --query to find candidates and a separate --item call to confirm each exact ID, its guide and its exported API.

Run node public/rams-source/tools/install.mjs with --target set to the app's absolute path, --items set to the confirmed comma-separated IDs and --dry-run. Inspect the file and dependency plan. If there are conflicting files, stop and report them without overwriting. Otherwise rerun without --dry-run, add the reported dependencies with the app's package manager and import src/rams/styles.css once using the appropriate app-relative import.

Keep the public Geist profile, preserve existing app behavior, and do not publish or deploy anything. Build the app, verify the installed components and report what changed, what passed and what you couldn't check.
```
