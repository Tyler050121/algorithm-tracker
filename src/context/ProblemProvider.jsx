import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { format, addDays } from 'date-fns';
import { REVIEW_INTERVALS } from '../constants';
import { normalizeProblem, createId } from '../utils/helpers';
import { ProblemContext } from './ProblemContext';
import { db } from '../db';

export const ProblemProvider = ({ children }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [problems, setProblems] = useState([]);
  const [problemGroups, setProblemGroups] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const [currentPlanSlug, setCurrentPlanSlug] = useState(
    localStorage.getItem('currentPlanSlug') || 'top-100-liked'
  );
  const [focusedProblemId, setFocusedProblemId] = useState(null);

  // 加载当前题库的题目
  const loadProblems = useCallback(async (slug) => {
    try {
      // 1. 从 API 获取题库基本信息
      const response = await fetch(`/api/list?slug=${slug}`);
      const data = await response.json();
      if (!data.groups) throw new Error('Failed to load study plan problems.');

      // 2. 从 IndexedDB 获取所有已保存的进度
      const savedProblemsArray = await db.problems.toArray();
      const savedUserData = {};
      savedProblemsArray.forEach(p => {
        savedUserData[p.id] = p;
      });

      // 3. 合并数据并构建分组
      const mergedGroups = data.groups.map(group => ({
        ...group,
        questions: group.questions.map(baseProblem => {
          const userData = savedUserData[baseProblem.id] || {};
          return normalizeProblem({
            ...baseProblem,
            ...userData,
            title: baseProblem.title, // 保留完整的 title 对象
            groupName: group.groupName, // 保留完整的 groupName 对象
            topic: group.groupName.zh, // 为了兼容旧逻辑，暂时保留
          });
        })
      }));

      const mergedProblems = mergedGroups.flatMap(group => group.questions);

      setProblemGroups(mergedGroups);
      setProblems(mergedProblems);
    } catch (error) {
      console.error('Error loading problems:', error);
      toast({ title: t('toast.loadError', '加载题库失败'), status: 'error', duration: 3000 });
    }
  }, [t, toast]);

  // 获取所有可选的题库列表
  useEffect(() => {
    const fetchStudyPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        const plans = await response.json();
        setStudyPlans(plans);
      } catch (error) {
        console.error('Error fetching study plans:', error);
      }
    };
    fetchStudyPlans();
  }, []);

  // 当题库 slug 变化时，加载新的题目
  useEffect(() => {
    loadProblems(currentPlanSlug);
    localStorage.setItem('currentPlanSlug', currentPlanSlug);
  }, [currentPlanSlug, loadProblems]);

  // Helper to update problem in both DB and State
  const updateProblemAndSave = useCallback(async (id, updater) => {
    try {
      // Get the latest state from DB to ensure consistency, or fall back to current state
      let currentProblem = problems.find(p => p.id === id);
      if (!currentProblem) {
        currentProblem = await db.problems.get(id);
      }
      
      if (!currentProblem) {
        console.error(`Problem with id ${id} not found`);
        return;
      }

      const newProblem = updater(currentProblem);

      // Update DB
      await db.problems.put(newProblem);

      // Update State
      setProblems((prev) => prev.map((problem) => (problem.id === id ? newProblem : problem)));
    } catch (error) {
      console.error('Failed to update problem:', error);
      toast({ title: t('toast.saveError', '保存失败'), status: 'error', duration: 3000 });
    }
  }, [problems, t, toast]);

  const completeProblem = useCallback(async (id, action) => {
    const isNew = action === 'new';
    const now = new Date();
    const nowISO = now.toISOString();

    try {
      let problem = problems.find(p => p.id === id);
      if (!problem) {
        problem = await db.problems.get(id);
        if (!problem) {
             toast({ title: t('toast.problemNotFound', '题目不存在'), status: 'error', duration: 2000, isClosable: true });
             return;
        }
        // Normalize fetched problem from DB just in case
        problem = normalizeProblem(problem);
      }

      const updater = (p) => {
        if (isNew) {
          const nextReviewDate = format(addDays(now, REVIEW_INTERVALS[0]), 'yyyy-MM-dd');
          return {
            ...p,
            status: 'learning',
            reviewCycleIndex: 0,
            nextReviewDate,
            learnHistory: [...p.learnHistory, { date: nowISO, plan: currentPlanSlug }],
          };
        }
        const nextIndex = p.reviewCycleIndex + 1;
        const reviewHistory = [...p.reviewHistory, { date: nowISO, plan: currentPlanSlug }];
        if (nextIndex >= REVIEW_INTERVALS.length) {
          return { ...p, status: 'mastered', reviewCycleIndex: REVIEW_INTERVALS.length, nextReviewDate: null, reviewHistory };
        }
        const nextReviewDate = format(addDays(new Date(), REVIEW_INTERVALS[nextIndex]), 'yyyy-MM-dd');
        return { ...p, status: 'learning', reviewCycleIndex: nextIndex, nextReviewDate, reviewHistory };
      };

      const updatedProblem = updater(problem);
      
      await db.problems.put(updatedProblem);

      // Update state if problem is in current view
      if (problems.some(p => p.id === id)) {
         setProblems(prev => prev.map(p => p.id === id ? updatedProblem : p));
      }

      toast({
        title: isNew ? t('toast.newSuccessTitle') : t('toast.reviewSuccessTitle'),
        description: isNew ? t('toast.newSuccessDesc') : t('toast.reviewSuccessDesc'),
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

    } catch (error) {
      console.error(error);
    }
  }, [problems, currentPlanSlug, t, toast]);

  const addSolution = useCallback((problemId, payload) => {
    updateProblemAndSave(problemId, (problem) => ({
      ...problem,
      solutions: [
        {
          ...payload,
          id: createId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          codes: Array.isArray(payload.codes) ? payload.codes : [],
          tags: Array.isArray(payload.tags) ? payload.tags : [],
        },
        ...problem.solutions,
      ],
    }));
  }, [updateProblemAndSave]);

  const updateSolution = useCallback((problemId, solutionId, payload) => {
    updateProblemAndSave(problemId, (problem) => ({
      ...problem,
      solutions: problem.solutions.map((solution) =>
        solution.id === solutionId
          ? { 
              ...solution, 
              ...payload, 
              updatedAt: new Date().toISOString() 
            }
          : solution
      ),
    }));
  }, [updateProblemAndSave]);

  const deleteSolution = useCallback((problemId, solutionId) => {
    updateProblemAndSave(problemId, (problem) => ({
      ...problem,
      solutions: problem.solutions.filter((solution) => solution.id !== solutionId),
    }));
  }, [updateProblemAndSave]);

  const undoHistory = useCallback((historyItem) => {
    const { problem, type, date } = historyItem;

    updateProblemAndSave(problem.id, (p) => {
      if (type === 'learn') {
        const newLearnHistory = p.learnHistory.filter(item => (typeof item === 'string' ? item : item.date) !== date);
        if (newLearnHistory.length === 0) {
          return {
            ...p,
            status: 'unstarted',
            learnHistory: [],
            reviewHistory: [],
            reviewCycleIndex: 0,
            nextReviewDate: null
          };
        }
        return { ...p, learnHistory: newLearnHistory };
      }

      if (type === 'review') {
        const newReviewHistory = p.reviewHistory.filter(item => (typeof item === 'string' ? item : item.date) !== date);
        const newReviewCycleIndex = Math.max(0, p.reviewCycleIndex - 1);
        const lastActionDate = newReviewHistory.length > 0
          ? newReviewHistory[newReviewHistory.length - 1].date
          : (p.learnHistory.length > 0 ? p.learnHistory[p.learnHistory.length - 1].date : new Date());
        
        const nextReviewDate = format(
          addDays(new Date(lastActionDate), REVIEW_INTERVALS[newReviewCycleIndex]),
          'yyyy-MM-dd'
        );

        return { ...p, status: 'learning', reviewHistory: newReviewHistory, reviewCycleIndex: newReviewCycleIndex, nextReviewDate };
      }
      
      return p;
    });

    toast({
      title: t('toast.undoSuccess', { name: problem.name, type: type === 'learn' ? '学习' : '复习' }),
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }, [updateProblemAndSave, t, toast]);

  const updateHistoryDate = useCallback((historyItem, newDateTime) => {
    const { problem, type, date: oldDate } = historyItem;
    const newTimestamp = new Date(newDateTime).toISOString();

    updateProblemAndSave(problem.id, (p) => {
      const historyField = type === 'learn' ? 'learnHistory' : 'reviewHistory';

      const newHistory = p[historyField]
        .map(item => {
          if (item.date !== oldDate) return item;
          return { ...item, date: newTimestamp };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const lastActionDate = newHistory.length > 0 ? newHistory[newHistory.length - 1].date : new Date();
      const reviewCycleIdx = p.reviewCycleIndex > 0 ? p.reviewCycleIndex : 0;
      const nextReviewDate = format(
        addDays(new Date(lastActionDate), REVIEW_INTERVALS[reviewCycleIdx]),
        'yyyy-MM-dd'
      );

      return { ...p, [historyField]: newHistory, nextReviewDate };
    });

    toast({
      title: t('toast.updateSuccess', { name: problem.name }),
      description: t('toast.updateDesc', "后续的复习计划也已自动调整。"),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [updateProblemAndSave, t, toast]);

  const exportData = useCallback(async (type = 'all') => {
    try {
      const allProblems = await db.problems.toArray();
      // Convert to the format expected by backup (object with IDs as keys)
      const exportObj = {};
      
      allProblems.forEach(p => {
        if (type === 'all') {
          exportObj[p.id] = p;
        } else if (type === 'solutions') {
          // Only export ID and solutions
          if (p.solutions && p.solutions.length > 0) {
            exportObj[p.id] = { id: p.id, solutions: p.solutions };
          }
        } else if (type === 'records') {
          // Export everything EXCEPT solutions
          const { solutions: _solutions, ...rest } = p;
          exportObj[p.id] = rest;
        }
      });
      
      const jsonString = JSON.stringify(exportObj);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const suffix = type === 'all' ? 'backup' : type;
      link.download = `algorithm-tracker-${suffix}-${format(new Date(), 'yyyyMMdd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: t('toast.exportSuccess'), status: 'success', duration: 2000 });
    } catch (error) {
      console.error('Export failed:', error);
      toast({ title: t('toast.exportError', '导出失败'), status: 'error', duration: 3000 });
    }
  }, [t, toast]);

  const importData = useCallback((file, type = 'all') => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dataStr = e.target.result;
        const data = JSON.parse(dataStr); // Validate JSON
        const problemsList = Object.values(data);
        
        if (problemsList.length > 0) {
           // Ensure valid problems
           const validProblems = problemsList.filter(p => p.id);
           
           if (type === 'all') {
             await db.problems.bulkPut(validProblems);
           } else {
             // 部分导入，需要与现有数据合并
             await db.transaction('rw', db.problems, async () => {
               // 如果是导入记录模式，先清空所有现有记录（保留题解）
               if (type === 'records') {
                 await db.problems.toCollection().modify(problem => {
                   problem.status = 'unstarted';
                   problem.reviewCycleIndex = 0;
                   problem.nextReviewDate = null;
                   problem.learnHistory = [];
                   problem.reviewHistory = [];
                 });
               }

               for (const p of validProblems) {
                 const existing = await db.problems.get(p.id);
                 
                 if (type === 'solutions') {
                   // 导入题解：如果备份中提供了题解，则覆盖现有题解
                   if (p.solutions) {
                     if (existing) {
                       await db.problems.update(p.id, { solutions: p.solutions });
                     } else {
                       // 如果题目不存在，创建新条目（仅包含题解）
                       await db.problems.add(p);
                     }
                   }
                 } else if (type === 'records') {
                   // 导入记录：覆盖状态、历史等
                   const { solutions: _solutions, ...recordData } = p;
                   
                   if (existing) {
                     // 更新记录数据（existing中的solutions会被保留）
                     await db.problems.update(p.id, recordData);
                   } else {
                     // 如果题目不存在，添加新条目（确保包含 ID）
                     recordData.id = p.id;
                     await db.problems.add(recordData);
                   }
                 }
               }
             });
           }
        }
        
        toast({ title: t('toast.importSuccess'), status: 'success', duration: 2000 });
        // 导入成功后刷新页面，确保状态完全同步
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error("Failed to import data:", error);
        toast({ title: t('toast.importError'), status: 'error', duration: 3000 });
      }
    };
    reader.readAsText(file);
  }, [t, toast]);

  const clearData = useCallback(async () => {
    try {
      // 修改为：只清空学习记录，保留题解
      await db.problems.toCollection().modify(problem => {
        problem.status = 'unstarted';
        problem.reviewCycleIndex = 0;
        problem.nextReviewDate = null;
        problem.learnHistory = [];
        problem.reviewHistory = [];
      });
      
      toast({ title: t('toast.clearSuccess'), status: 'warning', duration: 2000 });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Clear data failed:', error);
    }
  }, [t, toast]);

  const changePlan = useCallback((slug) => {
    if (slug !== currentPlanSlug) {
      setProblems([]);
      setCurrentPlanSlug(slug);
    }
  }, [currentPlanSlug]);

  const openSolutions = useCallback((id) => {
    setFocusedProblemId(id);
  }, []);

  const closeSolutions = useCallback(() => {
    setFocusedProblemId(null);
  }, []);

  const focusedProblem = problems.find((p) => p.id === focusedProblemId) ?? null;

  const value = {
    problems,
    problemGroups,
    studyPlans,
    currentPlanSlug,
    changePlan,
    completeProblem,
    addSolution,
    updateSolution,
    deleteSolution,
    undoHistory,
    updateHistoryDate,
    exportData,
    importData,
    clearData,
    openSolutions,
    closeSolutions,
    focusedProblem,
  };

  return <ProblemContext.Provider value={value}>{children}</ProblemContext.Provider>;
};
