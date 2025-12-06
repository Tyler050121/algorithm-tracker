import { format } from 'date-fns';

export const createId = () => Math.random().toString(36).slice(2, 9);

export function normalizeProblem(problem) {
  const normalizedSolutions =
    problem.solutions?.map((solution) => ({
      ...solution, // Preserve all other fields like codes, tags, etc.
      id: solution.id ?? createId(),
      title: solution.title ?? solution.name ?? '题解',
      notes: solution.notes ?? solution.text ?? '',
      link: solution.link ?? solution.url ?? '',
      createdAt: solution.createdAt ?? format(new Date(), 'yyyy-MM-dd'),
      tags: Array.isArray(solution.tags) ? solution.tags : [],
      codes: Array.isArray(solution.codes) ? solution.codes : [],
    })) ?? [];

  if (!normalizedSolutions.length && (problem.solutionText || problem.solutionLink)) {
    normalizedSolutions.push({
      id: createId(),
      title: '默认题解',
      notes: problem.solutionText ?? '',
      link: problem.solutionLink ?? '',
      createdAt: problem.startDate ?? format(new Date(), 'yyyy-MM-dd'),
    });
  }

  return {
    ...problem,
    status: problem.status ?? 'unstarted',
    nextReviewDate: problem.nextReviewDate ?? null,
    reviewCycleIndex: problem.reviewCycleIndex ?? 0,
    learnHistory: problem.learnHistory ?? [],
    reviewHistory: problem.reviewHistory ?? [],
    solutions: normalizedSolutions,
  };
}
