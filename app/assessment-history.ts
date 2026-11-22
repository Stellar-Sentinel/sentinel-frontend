export const MAX_ASSESSMENT_HISTORY = 5;

export type AssessmentHistoryItem = { address: string };

/** Keep recent assessments in page memory without persisting account data. */
export function addAssessment<T extends AssessmentHistoryItem>(history: T[], result: T, limit = MAX_ASSESSMENT_HISTORY): T[] {
  const boundedLimit = Math.max(0, Math.floor(limit));
  return [result, ...history.filter((item) => item.address !== result.address)].slice(0, boundedLimit);
}

export function removeAssessment<T extends AssessmentHistoryItem>(history: T[], address: string): T[] {
  return history.filter((item) => item.address !== address);
}
