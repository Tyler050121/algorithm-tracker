import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useProblems } from '../context/ProblemContext';
import { normalizeProblem } from '../utils/helpers';
import { STORAGE_KEY } from '../constants';

export const useHistoryStats = () => {
  const { problems } = useProblems();

  const allKnownProblems = useMemo(() => {
    const rawGlobalData = localStorage.getItem(STORAGE_KEY);
    const globalUserData = rawGlobalData ? JSON.parse(rawGlobalData) : {};
    const problemMap = new Map(problems.map(p => [String(p.id), p]));

    return Object.entries(globalUserData)
      .map(([id, userData]) => {
        const problemFromCurrentPlan = problemMap.get(id);
        if (problemFromCurrentPlan) {
          return problemFromCurrentPlan;
        }
        return normalizeProblem({
          id: parseInt(id),
          name: userData.name || `Problem ${id}`,
          difficulty: userData.difficulty || 'N/A',
          slug: userData.slug || null,
          ...userData,
        });
      });
  }, [problems]);

  const allProblemsWithHistory = useMemo(() =>
    allKnownProblems.filter(p => p.learnHistory.length > 0 || p.reviewHistory.length > 0),
    [allKnownProblems]
  );

  const historyData = useMemo(() => {
    if (!allProblemsWithHistory.length) {
      return {
        allHistory: [],
        totalLearns: 0,
        totalReviews: 0,
        activeDays: 0,
        historyByDate: new Map(),
      };
    }
    const history = [];
    const activity = new Map();
    let recordCounter = 0;

    const processRecord = (problem, type, item) => {
      const dateStr = format(parseISO(item.date), 'yyyy-MM-dd');
      const record = {
        type,
        date: item.date,
        plan: item.plan,
        problem,
        id: `${problem.id}-${type}-${item.date}-${recordCounter++}`,
      };
      history.push(record);
      activity.set(dateStr, (activity.get(dateStr) || 0) + 1);
    };

    allProblemsWithHistory.forEach((p) => {
      p.learnHistory.forEach(item => processRecord(p, 'learn', item));
      p.reviewHistory.forEach(item => processRecord(p, 'review', item));
    });
    
    const sortedHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date));
    const historyByDate = new Map();
    sortedHistory.forEach(record => {
       const dateStr = format(parseISO(record.date), 'yyyy-MM-dd');
       if (!historyByDate.has(dateStr)) historyByDate.set(dateStr, []);
       historyByDate.get(dateStr).push(record);
    });

    return {
      allHistory: sortedHistory,
      totalLearns: history.filter(h => h.type === 'learn').length,
      totalReviews: history.filter(h => h.type === 'review').length,
      activeDays: activity.size,
      historyByDate,
    };
  }, [allProblemsWithHistory]);

  return historyData;
};
