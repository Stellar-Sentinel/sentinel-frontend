# Responsive cache runbook

For each deployment, verify cache hit, miss, stale, invalidation, network
failure, and recovery behavior at mobile and desktop widths. Preserve user
input and pagination during retry, label the observation time, and render an
explicit unavailable state when optional fields are absent. Record only safe
status and timing metadata; never record response bodies or credentials.
