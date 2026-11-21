# Frontend caching strategy contract

Cache keys must identify the request scope and relevant pagination inputs.
Fresh, stale, miss, unavailable, and recovery states remain explicit. Cached
data is labeled with observation age, retries preserve user intent, and stale
data is never presented as a new on-chain fact. Public configuration contains no
credentials or private keys.
