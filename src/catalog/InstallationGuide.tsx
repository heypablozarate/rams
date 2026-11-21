import { CodeBlock } from "./CodeBlock";
import { RamsName } from "../brand/RamsName";

const installationPrompt = "Install RAMS components in the React application I'm working on. Use the component names or interface goal from this conversation. If the app or goal is unclear, ask me only for the missing detail.\n\nFind the app root by checking its package.json. Use an existing checkout of https://github.com/heypablozarate/rams, or clone that repository outside the app. Do not download a ZIP. If GitHub access fails, stop and report the error.\n\nIn the checkout, read public/rams-source/llms.txt, AGENTS.md and docs/foundations.md under public/rams-source. From the repository root, use node public/rams-source/tools/discover.mjs with --query to find candidates and a separate --item call to confirm each exact ID, its guide and its exported API.\n\nRun node public/rams-source/tools/install.mjs with --target set to the app's absolute path, --items set to the confirmed comma-separated IDs and --dry-run. Inspect the file and dependency plan. If there are conflicting files, stop and report them without overwriting. Otherwise rerun without --dry-run, add the reported dependencies with the app's package manager and import src/rams/styles.css once using the appropriate app-relative import.\n\nKeep the public Geist profile, preserve existing app behavior, and do not publish or deploy anything. Build the app, verify the installed components and report what changed, what passed and what you couldn't check.";

export default function InstallationGuide() {
  return (
    <>
      <h1 className="docs-page-title text-3xl font-semibold tracking-tight">
        Install <RamsName />
      </h1>
      <div className="docs-prose mt-6 space-y-7">
        <section>
          <h2 className="docs-section-title">Get the source from GitHub</h2>
          <p className="mt-3 text-muted-foreground">Browse components and usage here. Clone the GitHub repository to install the components you need, with their shared styles and licensed Geist fonts.</p>
          <a className="mt-4 inline-block docs-underlined-link" href="https://github.com/heypablozarate/rams">View source on GitHub</a>
          <div className="mt-4">
            <CodeBlock
              label="Terminal · clone the repository"
              code={'git clone https://github.com/heypablozarate/rams.git\ncd rams'}
            />
          </div>
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
            From the cloned repository root, inspect the installation plan:
          </p>
          <div className="mt-4">
            <CodeBlock
              label="Terminal · dry run"
              code="node public/rams-source/tools/install.mjs --target /path/to/app --items button,input,label --dry-run"
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
              code="node public/rams-source/tools/install.mjs --target /path/to/app --items button,input,label"
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
            Paste this into a coding agent in your React project. Tell it which
            components you want, or describe what you are building. No paths to fill in.
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
