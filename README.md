# Blueprint.js GL Exposure Proxy

Out-of-box Blueprint.js baseline for the Design-MD Research GL Exposure Proxy experiment.

The canonical source baseline is the standalone HTML workbench:

```text
/Users/viktorcea/vault/Agent-System/01-Project-Rooms/Work/Casualty/GL Exposure/prototypes/gl-exposure-workbench/index.html
```

This build intentionally avoids the later React/shadcn theme-switcher and uses real Blueprint.js React packages.

## Local Commands

```bash
npm install
npm run dev
npm run build
```

## Version Check

Package versions were checked before installation on June 5, 2026 with `npm view`, the Blueprint docs, and Palantir Blueprint GitHub releases.

- `@blueprintjs/core` 6.15.0
- `@blueprintjs/icons` 6.10.0
- `@blueprintjs/select` 6.2.1
- `@blueprintjs/table` 6.1.1

Blueprint v6 peer dependencies target React 18, so this baseline uses React 18 with a React-18-compatible Next.js line.
