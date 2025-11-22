import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { format, addDays } from 'date-fns';
import { REVIEW_INTERVALS, STORAGE_KEY } from '../constants';
import { normalizeProblem, createId } from '../utils/helpers';

const ProblemContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useProblems = () => {
  const context = useContext(ProblemContext);
  if (!context) {
    throw new Error('useProblems must be used within a ProblemProvider');
  }
  return context;
};

export const ProblemProvider = ({ children }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [problems, setProblems] = useState([]);
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
      const baseProblems = data.groups.flatMap(group => group.questions);

      // 2. 从全局 localStorage 获取所有用户进度
      const rawUserData = localStorage.getItem(STORAGE_KEY);
      const savedUserData = rawUserData ? JSON.parse(rawUserData) : {};

      // 3. 合并数据
      const mergedProblems = baseProblems.map((baseProblem) => {
        const userData = savedUserData[baseProblem.id] || {};
        const name = baseProblem.title.zh || baseProblem.title.en; // 适配 i18n
        return normalizeProblem({ ...baseProblem, ...userData, name });
      });

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

  // 当题目数据变化时，更新并保存全局用户进度
  useEffect(() => {
    if (problems.length) {
      // 1. 读取全局存档
      const rawGlobalData = localStorage.getItem(STORAGE_KEY);
      const globalUserData = rawGlobalData ? JSON.parse(rawGlobalData) : {};

      // 2. 将当前题库的进度更新到全局存档中
      problems.forEach(p => {
        globalUserData[p.id] = {
          name: p.name,
          difficulty: p.difficulty,
          slug: p.slug,
          status: p.status,
          nextReviewDate: p.nextReviewDate,
          reviewCycleIndex: p.reviewCycleIndex,
          learnHistory: p.learnHistory,
          reviewHistory: p.reviewHistory,
          solutions: p.solutions,
        };
      });

      // 3. 写回全局存档
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalUserData));
    }
  }, [problems]);

  const updateProblem = useCallback((id, updater) => {
    setProblems((prev) => prev.map((problem) => (problem.id === id ? updater(problem) : problem)));
  }, []);

  const completeProblem = useCallback((id, action) => {
    const isNew = action === 'new';
    const now = new Date();
    const nowISO = now.toISOString();

    const problemInCurrentPlan = problems.some((p) => p.id === id);

    if (problemInCurrentPlan) {
      updateProblem(id, (problem) => {
        if (isNew) {
          const nextReviewDate = format(addDays(now, REVIEW_INTERVALS[0]), 'yyyy-MM-dd');
          return {
            ...problem,
            status: 'learning',
            reviewCycleIndex: 0,
            nextReviewDate,
            learnHistory: [...problem.learnHistory, { date: nowISO, plan: currentPlanSlug }],
          };
        }
        const nextIndex = problem.reviewCycleIndex + 1;
        const reviewHistory = [...problem.reviewHistory, { date: nowISO, plan: currentPlanSlug }];
        if (nextIndex >= REVIEW_INTERVALS.length) {
          return { ...problem, status: 'mastered', reviewCycleIndex: REVIEW_INTERVALS.length, nextReviewDate: null, reviewHistory };
        }
        const nextReviewDate = format(addDays(new Date(), REVIEW_INTERVALS[nextIndex]), 'yyyy-MM-dd');
        return { ...problem, status: 'learning', reviewCycleIndex: nextIndex, nextReviewDate, reviewHistory };
      });
    } else {
      // 处理不在当前计划中的题目（通过全局数据）
      const rawGlobalData = localStorage.getItem(STORAGE_KEY);
      const globalUserData = rawGlobalData ? JSON.parse(rawGlobalData) : {};
      const problemToUpdate = globalUserData[id];

      if (!problemToUpdate) {
        toast({ title: t('toast.problemNotFound', '题目不存在'), status: 'error', duration: 2000, isClosable: true });
        return;
      }

      const normalizedProblem = normalizeProblem(problemToUpdate);
      let updatedProblem;
      if (isNew) {
        const nextReviewDate = format(addDays(now, REVIEW_INTERVALS[0]), 'yyyy-MM-dd');
        updatedProblem = {
          ...normalizedProblem,
          status: 'learning',
          reviewCycleIndex: 0,
          nextReviewDate,
          learnHistory: [...normalizedProblem.learnHistory, { date: nowISO, plan: currentPlanSlug }],
        };
      } else {
        const nextIndex = normalizedProblem.reviewCycleIndex + 1;
        const reviewHistory = [...normalizedProblem.reviewHistory, { date: nowISO, plan: currentPlanSlug }];
        if (nextIndex >= REVIEW_INTERVALS.length) {
          updatedProblem = { ...normalizedProblem, status: 'mastered', reviewCycleIndex: REVIEW_INTERVALS.length, nextReviewDate: null, reviewHistory };
        } else {
          const nextReviewDate = format(addDays(new Date(), REVIEW_INTERVALS[nextIndex]), 'yyyy-MM-dd');
          updatedProblem = { ...normalizedProblem, status: 'learning', reviewCycleIndex: nextIndex, nextReviewDate, reviewHistory };
        }
      }
      globalUserData[id] = updatedProblem;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalUserData));
      // Manually trigger a re-read for history board to update immediately
      loadProblems(currentPlanSlug);
    }

    toast({
      title: isNew ? t('toast.newSuccessTitle') : t('toast.reviewSuccessTitle'),
      description: isNew ? t('toast.newSuccessDesc') : t('toast.reviewSuccessDesc'),
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [problems, currentPlanSlug, t, toast, updateProblem, loadProblems]);

  const addSolution = useCallback((problemId, payload) => {
    updateProblem(problemId, (problem) => ({
      ...problem,
      solutions: [
        {
          id: createId(),
          title: payload.title,
          notes: payload.notes,
          link: payload.link,
          createdAt: format(new Date(), 'yyyy-MM-dd'),
        },
        ...problem.solutions,
      ],
    }));
  }, [updateProblem]);

  const deleteSolution = useCallback((problemId, solutionId) => {
    updateProblem(problemId, (problem) => ({
      ...problem,
      solutions: problem.solutions.filter((solution) => solution.id !== solutionId),
    }));
  }, [updateProblem]);

  const undoHistory = useCallback((historyItem) => {
    const { problem, type, date } = historyItem;

    updateProblem(problem.id, (p) => {
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
  }, [updateProblem, t, toast]);

  const updateHistoryDate = useCallback((historyItem, newDateTime) => {
    const { problem, type, date: oldDate } = historyItem;
    const newTimestamp = new Date(newDateTime).toISOString();

    updateProblem(problem.id, (p) => {
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
  }, [updateProblem, t, toast]);

  const exportData = useCallback(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `algorithm-tracker-backup-${format(new Date(), 'yyyyMMdd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: t('toast.exportSuccess'), status: 'success', duration: 2000 });
  }, [t, toast]);

  const importData = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        JSON.parse(data); // 验证 JSON 格式
        localStorage.setItem(STORAGE_KEY, data); // 直接存储字符串，因为已经是 JSON 字符串了
        toast({ title: t('toast.importSuccess'), status: 'success', duration: 2000 });
        loadProblems(currentPlanSlug); // 重新加载
      } catch (error) {
        console.error("Failed to import data:", error);
        toast({ title: t('toast.importError'), status: 'error', duration: 3000 });
      }
    };
    reader.readAsText(file);
  }, [t, toast, loadProblems, currentPlanSlug]);

  const clearData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: t('toast.clearSuccess'), status: 'warning', duration: 2000 });
    setTimeout(() => window.location.reload(), 1000);
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
    studyPlans,
    currentPlanSlug,
    changePlan,
    completeProblem,
    addSolution,
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
