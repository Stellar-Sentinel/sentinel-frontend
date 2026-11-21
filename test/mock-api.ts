export type MockResponse = { status: number; body: unknown };

/** Small fetch replacement for deterministic tests; it never contacts a network. */
export function mockJsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

export function mockSequence(responses: MockResponse[]) {
  let index = 0;
  return async () => {
    const response = responses[Math.min(index++, responses.length - 1)];
    return mockJsonResponse(response.body, response.status);
  };
}
