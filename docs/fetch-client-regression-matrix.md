# Fetch client regression matrix

Use mocked responses for loading, success, malformed optional fields, empty,
HTTP failure, network failure, abort, retry, pagination, and recovery. Assert
that accessible status copy is associated with the affected region, retries do
not duplicate rows, optional fields do not crash rendering, and fixtures contain
no credentials, private keys, or real account data.
