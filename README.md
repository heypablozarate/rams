# RAMS by PabloZarate™

RAMS is a design system for React. The catalog includes interactive component previews, usage and code, and guides for color, typography, shape, density, and motion. This edition uses the bundled Geist fonts.

## Run the catalog

Use Node.js 24 and npm. From the repository root, install the locked dependencies and start the development server.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
```

## Build the static site

```sh
npm run build
npm run preview
```

The build generates the catalog documents and source listings, checks TypeScript, and writes the static site to `dist/`. It verifies the code listings, the source package manifest, and the fonts in the finished site. A static host can serve that directory at the domain root. Component pages use hash routes such as `/#/components/signature-pad`.

## Use a component

Browse the [component catalog](https://rams-design-system.heypablozarate.chatgpt.site) and install selected components from this GitHub checkout:

```sh
node public/rams-source/tools/install.mjs --target /path/to/app --items button,input,label --dry-run
node public/rams-source/tools/install.mjs --target /path/to/app --items button,input,label
```

Add the dependencies reported by the installer with your app's package manager. See the [source README](public/rams-source/README.md) for imports and requirements.

## Licenses

The distributable source includes its [license](public/rams-source/LICENSE) and [attribution notices](public/rams-source/NOTICE.md). The Geist fonts include the [SIL Open Font License](public/rams-source/fonts/OFL.txt). The catalog retains the [original contributions notice](public/legal/OWN-CONTRIBUTIONS.txt) and [third-party notices](public/legal/). These notices retain their existing scope.
