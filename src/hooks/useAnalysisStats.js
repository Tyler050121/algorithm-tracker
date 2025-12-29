import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useProblems } from '../context/ProblemContext';
import { normalizeProblem } from '../utils/helpers';
import { db } from '../db';

export const useAnalysisStats = () => {
  const { problems } = useProblems(); // 当前计划的题目
  const [allProblemsFromDB, setAllProblemsFromDB] = useState([]);

  // 从数据库加载所有题目
  useEffect(() => {
    const fetchAllProblems = async () => {
      try {
        const all = await db.problems.toArray();
        setAllProblemsFromDB(all);
      } catch (error) {
        console.error('获取历史统计失败:', error);
      }
    };
    
    fetchAllProblems();
  }, [problems]); // 当当前题目变化时重新获取（通常意味着有更新）

  const allKnownProblems = useMemo(() => {
    // 创建当前计划题目的映射，以确保使用最新的内存状态
    const problemMap = new Map(problems.map(p => [String(p.id), p]));

    return allProblemsFromDB.map((dbProblem) => {
      const problemFromCurrentPlan = problemMap.get(String(dbProblem.id));
      if (problemFromCurrentPlan) {
        return problemFromCurrentPlan;
      }
      return normalizeProblem(dbProblem);
    });
  }, [problems, allProblemsFromDB]);

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
