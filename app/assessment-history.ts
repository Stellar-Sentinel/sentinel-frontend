export type AssessmentWithAddress = { address: string };

export function rememberAssessment<T extends AssessmentWithAddress>(
  current: T[],
  result: T,
  limit = 5,
) {
  return [result, ...current.filter((item) => item.address !== result.address)].slice(0, limit);
}

export function removeAssessment<T extends AssessmentWithAddress>(current: T[], address: string) {
  return current.filter((item) => item.address !== address);
}
