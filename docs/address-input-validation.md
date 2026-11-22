# Address input validation

The account screening form accepts Stellar account address shapes used by the backend:

- Classic accounts start with `G` and contain 56 characters.
- Muxed accounts start with `M` and contain 69 characters.

The browser trims pasted or typed whitespace and checks only the Stellar alphabet and expected length. This is a fast client-side boundary to avoid avoidable requests; it does not calculate or prove a StrKey checksum, confirm that an account exists, or select a network. The backend remains authoritative for checksum validation, network availability, Horizon access, and the `/risk/score` response.

Invalid input shows a format hint and does not call the backend. A valid-format value is submitted unchanged after trimming. If a valid request fails, the UI shows the server or network error and keeps the last successful assessment visible when one exists. Missing or optional response fields must remain explicit; the frontend must not invent account activity, scores, or personal data.

The examples below are placeholders for tests and documentation only. They are deliberately not real accounts:

```text
GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

For local development, configure only the public API origin with `NEXT_PUBLIC_API_BASE_URL` as described in the README. Vercel previews must point at a backend environment whose CORS configuration includes the preview origin. Rollbacks should verify the frontend build, API origin, and backend address-validation contract together.
