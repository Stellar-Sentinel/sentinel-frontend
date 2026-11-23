export const MAX_IN_MEMORY_ASSESSMENTS = 5;

/** Keep recent assessments available only for this loaded page session. */
export function retainRecentAssessments(current, result) {
  return [result, ...current.filter((item) => item.address !== result.address)].slice(0, MAX_IN_MEMORY_ASSESSMENTS);
}
