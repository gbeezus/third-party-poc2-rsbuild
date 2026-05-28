# third-party-poc2-rsbuild — Module Federation remote (POC 2, rsbuild)

Working federation remote for POC 2. Replaces the Next.js attempt at
[`../third-party-poc2/`](../third-party-poc2/) because Next.js's webpack
config wraps every chunk (including the federation entry) in its own
`webpackChunk_N_E` chunk-loading protocol, which non-Next.js federation
hosts can't decode.

Pairs with [`../shell-poc2-rsbuild/`](../shell-poc2-rsbuild/) (the host)
to deliver the only end-to-end working POC 2 demo.

| Repo | Role | Port |
|---|---|---|
| `shell-poc2-rsbuild` | Federation host | 3010 |
| `third-party-poc2-rsbuild` (this) | Federation remote | 3011 |

## The federation contract

```ts
// rsbuild.config.ts
pluginModuleFederation({
  name: 'thirdparty',
  filename: 'remoteEntry.js',
  exposes: { './Tool': './src/components/Tool.tsx' },
  shared: {
    react: { singleton: true, requiredVersion: false },
    'react-dom': { singleton: true, requiredVersion: false },
  },
})
```

The host imports it as:
```ts
const FederatedTool = lazy(() => import('thirdparty/Tool'));
```

CORS headers are set on the dev server so the host on `:3010` can fetch
`remoteEntry.js` cross-origin and the browser will evaluate the script.

## Exposed component contract

```ts
interface ToolProps {
  session?: { userName?: string; agency?: string };
}
```

The `session` prop is the documented auth-handoff contract. The host
passes a session object derived from its own SSO context; the federated
component renders it without owning the auth logic. See
[`../shell-poc2-rsbuild/README.md`](../shell-poc2-rsbuild/README.md) for
the three propagation patterns and federal SSO/PIV refresh notes.

## How this differs from third-party-poc2 (Next.js)

The component source is **identical** — copied from
[`../third-party-poc2/components/Tool.tsx`](../third-party-poc2/components/Tool.tsx)
unchanged. The only thing that changed is the build pipeline. Next.js
wraps every webpack chunk — including the federation entry — in its
`webpackChunk_N_E` chunk-loading protocol, so the bottom-line
`window.thirdparty = …` initializer never runs when the script is
loaded by a non-Next.js host. rsbuild emits a standalone federation
entry that any MF host can consume.

**What this means for the real engagement depends on the third party's
build stack** — which we haven't been told. See
[`../shell-poc2-rsbuild/README.md`](../shell-poc2-rsbuild/README.md)
for the conditional table:

- **rsbuild / rspack / standard webpack / Next.js Pages Router** —
  federation works without a sidecar.
- **Next.js App Router (Next 16+) / Astro / non-webpack frameworks** —
  the third party would likely need a separate sidecar build pipeline
  alongside their main app, just for the federated surface. Two
  builds, two artifacts.
- **Vite** — works with `@module-federation/vite`, but that plugin is
  less mature.

The proposal should start by asking what the third party builds with.
That single answer determines whether federation is cheap or expensive
for them.

## Run

```
npm install
npm run dev   # http://localhost:3011
```

Visit `http://localhost:3011/` to see the Tool standalone. Visit
`http://localhost:3010/tool` (with shell-poc2-rsbuild also running) to
see it federated into the shell.

## Render.com deploy

`render.yaml` is committed. After deploy, copy the URL of this service
+ `/remoteEntry.js` and set it as `PUBLIC_REMOTE_URL` on
shell-poc2-rsbuild.
