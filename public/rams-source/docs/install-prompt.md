# Install RAMS in an application

Paste this prompt into an agent with filesystem and shell tools, replacing the two paths and the goal:

```text
Use the RAMS source checkout at <RAMS_SOURCE> in my React application at <APP_PATH>.
Read its llms.txt, AGENTS.md and docs/foundations.md first. My goal is <INTERFACE_GOAL>.
Use node tools/discover.mjs --query "<task>" and --item <exact-id> to select real IDs.
Read each selected guide, source exports and inherited props before using them.
Stay in the default Geist profile unless I explicitly provide a project profile; then
use --project <APP_PATH> --profile <PROFILE_PATH> and read its local rules/styles.
Never infer a private profile or copy its resources into the public source package.
Run the local installer in dry-run mode, inspect its file/dependency plan, then install
the selected components. Preserve existing files; resolve conflicts without overwriting
user changes. Install the required package versions through my project's package manager
and import the shared styles once.
Build the interface with semantic roles, fluid typography and accessible native controls.
Use one primary action per active view. Let text wrap; preserve browser text preferences.
Compile the project and check keyboard focus, relevant states and narrow/wide reflow.
Report what changed, what passed and what could not be verified. Do not publish anything.
```
