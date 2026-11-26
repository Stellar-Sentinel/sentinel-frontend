# Vercel observability operations

The frontend exposes a read-only `GET /api/observability` endpoint for deployment triage. It returns only optional, non-secret metadata:

```json
{
  "environment": "preview",
  "deployment_id": "dpl_…",
  "commit_sha": "…",
  "commit_ref": "fix/177",
  "api_origin": "https://api.example.test"
}
```

The endpoint normalizes `NEXT_PUBLIC_API_BASE_URL` to its HTTP(S) origin, removes paths and query strings, bounds text fields, and omits invalid or absent values. It never returns request bodies, headers, account identifiers, transaction hashes, scores, response payloads, API tokens, or private keys. Responses are marked `no-store` and `nosniff`.

## Release checks

For a Vercel preview and production deployment:

1. Open `/api/observability` and confirm the environment, commit, and intended public API origin.
2. Confirm the browser can reach the configured Render origin and that Render CORS allows the exact preview or production origin.
3. Exercise loading, empty, unavailable, timeout, retry, and recovery states. A failed refresh must preserve a prior successful observation where the UI supports it.
4. Check retry controls with keyboard focus at a narrow viewport.
5. Record the deployment URL, commit, API origin, and observed status in the release note; do not record account data or credentials.

If the metadata or API origin is wrong, stop promotion and correct Vercel environment configuration before retrying. If a production regression is already live, roll back to the last verified deployment, then re-run these checks.
