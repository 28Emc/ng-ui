# @emc-dev/ng-ui

Angular 22 UI component library (standalone components, `ui-*` selectors) with a
demo app and Storybook. Built with Angular CDK, Forms, Overlay, and Router on
Tailwind CSS v4.

## Requirements

- Node.js >= 20
- pnpm >= 11 (see `packageManager` in `package.json`)

## Getting started

```bash
pnpm install
pnpm build      # build the library -> dist/ng-ui
pnpm start      # ng serve demo -> http://localhost:4200
```

The demo resolves `@emc-dev/ng-ui` **from source** through TS paths
(`demo/tsconfig.app.json`), so there is no install/rebuild step between
editing the library and reloading the demo.

## Scripts

| Script              | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| `pnpm build`        | Build `@emc-dev/ng-ui` (`ng build ng-ui`)                   |
| `pnpm build:demo`   | Build the demo app (`ng build demo`)                        |
| `pnpm start`        | Dev server for the demo (`ng serve demo`)                   |
| `pnpm build:styles` | Compile the Tailwind theme -> `projects/ng-ui/styles.css`   |
| `pnpm analyze`      | Bundle-size report from `dist/ng-ui` -> `dist/bundle-stats` |
| `pnpm test`         | Run unit tests (vitest)                                     |
| `pnpm lint`         | ESLint                                                      |
| `pnpm storybook`    | Storybook dev server (port 6006)                            |
| `pnpm chromatic`    | Chromatic visual regression                                 |
| `pnpm changeset`    | Create a changeset entry                                    |
| `pnpm release`      | Build + styles + `changeset publish`                        |

## Package structure

```
projects/
  ng-ui/        the @emc-dev/ng-ui library (src/lib/**, src/public-api.ts)
demo/           showcase app consuming the library from source
.storybook/     Storybook config (compodoc + a11y)
scripts/        analyze-ng-ui.mjs (bundle report), patch-ng-ui-exports.mjs
docs/           architecture notes
```

## Publishing

Releases run via Changesets: merge a `changeset/*.md` entry into `main`, and the
`Release` workflow opens a version PR; merging it publishes to npm with GitHub
trusted publishing (see `.github/workflows/release.yml`).

## Docs

See [`docs/`](./docs) for architecture and future-implementation notes, and
[`projects/ng-ui/CHANGELOG.md`](./projects/ng-ui/CHANGELOG.md) for release history.
