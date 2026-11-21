import { CodeBlock } from "./CodeBlock";
import { RamsName } from "../brand/RamsName";

const installationPrompt = `Use the RAMS source checkout at <RAMS_SOURCE> in my React application at <APP_PATH>.
My goal is <GOAL>.
Read llms.txt, AGENTS.md and docs/foundations.md in the source checkout first.
Use node tools/discover.mjs --query "<task>" and --item <exact-id>.
Read the selected source exports, inherited props and attached guides.
Keep the default Geist profile unless I explicitly supply a project profile.
Run node tools/install.mjs from <RAMS_SOURCE> with --target <APP_PATH>, the chosen
--items IDs and --dry-run. Review its file plan and exact package versions, then install.
Keep existing code and resolve differing files before retrying the installer.
Install the reported package versions with the application's package manager.
Import "./rams/styles.css" once and use the installed component exports.
Preserve the application's APIs, data and services. Compose with RAMS semantic tokens,
fluid typography and one primary action per active view. Let labels wrap and controls grow.
Preserve browser text preferences, keyboard navigation, visible focus and reduced motion.
Compile the application and check its relevant states and narrow/wide layouts.
Report changes, checks performed and anything unverified. Do not publish anything.`;

export default function InstallationGuide() {
  return (
    <>
      <h1 className="docs-page-title text-3xl font-semibold tracking-tight">
        Install <RamsName />
      </h1>
      <div className="docs-prose mt-6 space-y-7">
        <section>
          <h2 className="docs-section-title">Get the source</h2>
          <p className="mt-3 text-muted-foreground">Download and extract the source ZIP. Open the extracted <code>rams-source</code> folder before running the commands below. It includes the installer, component source, guides and licensed Geist fonts.</p>
          <a className="mt-4 inline-block docs-underlined-link" href="/rams-source.zip" download>Download RAMS source ZIP</a>
        </section>
        <section>
          <h2 className="docs-section-title">Choose components</h2>
          <p className="mt-3 text-muted-foreground">
            Use the public <RamsName /> source checkout with an existing React application,
            TypeScript and a build tool that supports CSS imports. Check the
            manifest for Node and React requirements and component IDs.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3 text-sm">
            <a className="underline" href="/rams-source/rams.json">Source manifest</a>
            <a className="underline" href="/rams-source/README.md">Source README</a>
            <a className="underline" href="/components.json">Component catalog</a>
          </div>
        </section>
        <section>
          <h2 className="docs-section-title">Install from source</h2>
          <p className="mt-3 text-muted-foreground">
            From the checkout containing <code>rams.json</code> and{" "}
            <code>tools/install.mjs</code>, inspect the installation plan:
          </p>
          <div className="mt-4">
            <CodeBlock
              label="Terminal · dry run"
              code="node tools/install.mjs --target /path/to/app --items button,input,label --dry-run"
            />
          </div>
          <p className="mt-3 text-muted-foreground">
            The plan lists files and exact package versions. Conflicting files
            stop installation; keep your changes and resolve them before continuing.
            Then copy the selected source into <code>src/rams</code>:
          </p>
          <div className="mt-4">
            <CodeBlock
              label="Terminal · install"
              code="node tools/install.mjs --target /path/to/app --items button,input,label"
            />
          </div>
          <p className="mt-3 text-muted-foreground">
            Install the package versions reported by the installer with your
            application's package manager.
          </p>
        </section>
        <section>
          <h2 className="docs-section-title">Import styles and exports</h2>
          <p className="mt-3 text-muted-foreground">
            Import the shared stylesheet once. Read each component's TypeScript
            exports and caller-owned callbacks before composing it.
          </p>
          <div className="mt-4">
            <CodeBlock
              label="TypeScript"
              code={'import "./rams/styles.css";\nimport { Button } from "./rams/components/button";\nimport { Input } from "./rams/components/input";\nimport { Label } from "./rams/components/label";'}
            />
          </div>
        </section>
        <section>
          <h2 className="docs-section-title">Use the public foundations</h2>
          <p className="mt-3 text-muted-foreground">
            The public core starts neutral. Customize semantic color, text and
            surface roles in your application while preserving fluid type, visible
            focus and reduced-motion behavior.
          </p>
          <p className="mt-3 text-muted-foreground">
            Geist Sans supplies UI and body type; Geist Serif Regular 400 is for
            editorial headings. Preserve the included SIL OFL 1.1 notices and use
            the supplied font styles.
          </p>
          <p className="mt-3 text-muted-foreground">
            Default density needs no attribute. The public stylesheet supports{" "}
            <code>data-density="compact"</code> and{" "}
            <code>data-density="wide"</code> on <code>html</code>.
          </p>
        </section>
        <section>
          <h2 className="docs-section-title">Use with an agent</h2>
          <p className="mt-3 text-muted-foreground">
            Use an agent with filesystem and shell tools. Replace{" "}
            <code>RAMS_SOURCE</code>, <code>APP_PATH</code> and <code>GOAL</code> in
            the prompt. Source installation runs locally without a <RamsName /> server or MCP.
          </p>
          <div className="mt-4">
            <CodeBlock label="Agent installation prompt" code={installationPrompt} />
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3 text-sm">
            <a className="underline" href="/rams-source/AGENTS.md">Agent instructions</a>
            <a className="underline" href="/rams-source/docs/install-prompt.md">Installation prompt</a>
            <a className="underline" href="/llms.txt">Agent reference</a>
          </div>
        </section>
      </div>
    </>
  );
}
