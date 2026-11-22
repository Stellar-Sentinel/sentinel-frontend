# Configuration and environment operations

The frontend has one runtime integration setting:

| Variable | Scope | Local default | Secret? |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Public browser API base | `http://localhost:8000` | No |

## Precedence and build behavior

Next.js resolves a variable from the first available source in this order:
`process.env`, `.env.$(NODE_ENV).local`, `.env.local` (except in test mode),
`.env.$(NODE_ENV)`, then `.env`. Use `.env.local` for local overrides, and
configure preview or production values in the deployment environment rather
than committing an environment file. The
frontend reads `NEXT_PUBLIC_API_BASE_URL` when the client bundle is built, so a
change to a Vercel environment variable requires a new deployment to reach the
browser.

The resolver trims surrounding whitespace, removes trailing slashes, preserves
an optional API path, and falls back to the local default when the variable is
missing or blank. This keeps request paths stable when callers append routes.

## Local development

1. Copy the example file: `cp .env.example .env.local`.
2. Set the value to the backend origin, normally `http://localhost:8000`.
3. Configure the backend `CORS_ORIGINS` to include `http://localhost:3000`.
4. Start the frontend with `npm run dev` and confirm the browser calls the
   configured backend rather than a sample or fallback service.

Do not put API tokens, private keys, cookies, credentials, or personal account
data in this variable. Because it is prefixed with `NEXT_PUBLIC_`, its value is
visible in the browser bundle.

## Preview and production

For each Vercel environment, set an explicit HTTPS API base and redeploy after
changing it. Add the exact preview or production frontend origin to the
backend's `CORS_ORIGINS`; a backend that allows only localhost will make the
deployed UI appear unavailable. Before promotion, verify the preview and
production API bases point at the intended backend and that the backend's
network, contract, and RPC configuration is still valid.

## Validation and rollback

The resolver contract is covered by `test/config.test.ts`. Run the focused
checks with:

```bash
npm test -- --test-name-pattern='public API base|trailing slashes|configured value'
npm run lint
npm run build
```

If a deployment calls the wrong backend or fails CORS checks, compare the
deployed build's API base with the intended environment, correct the variable,
and redeploy. Roll back to the last known-good deployment if the issue cannot
be corrected quickly; do not add a secret to the public variable as a workaround.
