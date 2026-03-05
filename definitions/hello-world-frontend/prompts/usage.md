# Usage

## Overview
This template provides a simple, static-style frontend experience in the Vite reference stack.
The default UI intentionally highlights rPotential branding so it is immediately visible after generation.

## Included Behavior
- `src/pages/HomePage.tsx` renders an informational landing page with deployment details.
- Hostname parsing infers branch name from subdomain patterns like `{branch}-{repo}.domain.tld`.
- A deployment timestamp is rendered client-side.
- `.github/workflows/*` includes Azure Static Web Apps deployment, cleanup, and setup verification workflows.

## Customize
- Replace deployment/domain values with your own hosting details.
- Update the feature and stack sections to match your app.
- Extend the page into multiple routes by adding entries in `src/main.tsx`.

## Commands
```bash
bun install
bun run dev
bun run build
bun run lint
```

## Notes
- Uses `createBrowserRouter` and route-level `errorElement` from the base reference.
- Worker and API scaffolding remain available from the reference template if you want to add endpoints.
- For Azure SWA workflows, configure `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID` GitHub secrets.
