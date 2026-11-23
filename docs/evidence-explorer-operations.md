# Evidence explorer operations

The evidence explorer connects a contract event's on-chain facts with the backend evidence that
explains how the event was produced. It never treats a score or heuristic as proof of fraud,
compliance, or account ownership.

## Evidence states

The UI must distinguish these states:

- `verified`: the backend evidence digest matches the digest-bearing contract event.
- `unavailable`: the event is valid, but the backend has no evidence record or the evidence
  endpoint is not reachable.
- `mismatch`: both records exist but their digests differ; show the references for investigation
  and do not present the evidence as verified.
- `loading` and `error`: show progress or a retry action without removing already loaded events.

On-chain facts include the contract, ledger, event topics, score, digest, and transaction link.
Backend observations include evidence timestamps, source status, and verification results. Raw
reports, secrets, and PII stay off-chain and must not be copied into the event detail view.

## Deployment and rollback

The frontend only needs the public `NEXT_PUBLIC_API_BASE_URL`. The backend must expose the
coordinated `/events` and evidence response, and its contract ID and RPC network must match the
contract deployment. Preview deployments use the preview API origin and must not point at a
production write endpoint. Before a release, check a known event, a missing-evidence response,
and a digest mismatch in a non-production environment. Rollback the frontend if these states are
not rendered explicitly; do not change contract or backend schemas from the frontend.

## Local setup

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Use only public mock responses in local development. Never add a real account, token, private key,
or raw report to fixtures, screenshots, or source control.
