import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Box,
  useDisclosure,
  useToast,
  Flex,
  Heading,
  HStack,
  IconButton,
  Button,
  Tag,
  useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddIcon, SettingsIcon } from '@chakra-ui/icons';
import { format, addDays, isBefore, startOfToday, sub, parseISO } from 'date-fns';
import { REVIEW_INTERVALS } from './constants';
import Dashboard from './components/Dashboard';
import ProblemsBoard from './components/ProblemsBoard';
import SolutionDrawer from './components/SolutionDrawer';
import NewSolveModal from './components/NewSolveModal';
import SettingsModal from './components/SettingsModal';
import HistoryBoard from './components/HistoryBoard';

const STORAGE_KEY = 'algorithmTrackerProblems_ALL'; // 唯一的、全局的存储键
const createId = () => Math.random().toString(36).slice(2, 9);

const MotionBox = motion(Box);
const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(12px)' },
  enter: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -12, filter: 'blur(12px)' },
};
const pageTransition = {
  type: 'tween',
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
};

const titleAnimation = keyframes`
  0% { transform: scale(1) rotate(-1deg); }
  50% { transform: scale(1.03) rotate(1deg); }
  100% { transform: scale(1) rotate(-1deg); }
`;

function normalizeProblem(problem) {
  const normalizedSolutions =
    problem.solutions?.map((solution) => ({
      id: solution.id ?? createId(),
      title: solution.title ?? solution.name ?? '题解',
      notes: solution.notes ?? solution.text ?? '',
      link: solution.link ?? solution.url ?? '',
      createdAt: solution.createdAt ?? format(new Date(), 'yyyy-MM-dd'),
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

function App() {
  const { t } = useTranslation();
  const location = useLocation();
  const [problems, setProblems] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const [currentPlanSlug, setCurrentPlanSlug] = useState(
    localStorage.getItem('currentPlanSlug') || 'top-100-liked'
  );
  const [search, setSearch] = useState('');
  const [focusedProblemId, setFocusedProblemId] = useState(null);
  const toast = useToast();
  const newSolveModal = useDisclosure();
  const settingsModal = useDisclosure();

  const headerBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const buttonColor = useColorModeValue('teal.600', 'teal.200');
  const buttonBg = useColorModeValue('teal.50', 'whiteAlpha.200');

  const today = startOfToday();
  const todayStr = format(today, 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');

  // 加载当前题库的题目
  const loadProblems = async (slug) => {
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
      toast({ title: '加载题库失败', status: 'error', duration: 3000 });
    }
  };

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
  }, [currentPlanSlug, t]);

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

  const handleSelectPlan = (slug) => {
    if (slug !== currentPlanSlug) {
      setProblems([]); // 切换时先清空，避免闪烁
      setCurrentPlanSlug(slug);
    }
  };

  const stats = useMemo(() => {
    const unstartedCount = problems.filter((p) => p.status === 'unstarted').length;
    const learningCount = problems.filter((p) => p.status === 'learning').length;
    const masteredCount = problems.filter((p) => p.status === 'mastered').length;
    return { unstartedCount, learningCount, masteredCount };
  }, [problems]);

  const masteredProblems = useMemo(
    () => problems.filter((p) => p.status === 'mastered'),
    [problems]
  );

  const toReviewToday = useMemo(() => {
    const todayProblems = problems.filter(
      (p) =>
        p.nextReviewDate &&
        isBefore(new Date(p.nextReviewDate), addDays(today, 1)) &&
        p.status !== 'mastered'
    );
    return todayProblems.sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));
  }, [problems, today]);

  const toReviewTomorrow = useMemo(
    () =>
      problems.filter(
        (p) => p.nextReviewDate === tomorrowStr && p.status !== 'mastered'
      ),
    [problems, tomorrowStr]
  );

  const newSuggestions = useMemo(
    () => problems.filter((p) => p.status === 'unstarted').slice(0, 8),
    [problems]
  );

  const progressPie = useMemo(
    () => [
      { name: t('dashboard.charts.pieLabels.unstarted'), value: stats.unstartedCount },
      { name: t('dashboard.charts.pieLabels.learning'), value: stats.learningCount },
      { name: t('dashboard.charts.pieLabels.mastered'), value: stats.masteredCount },
    ],
    [t, stats.unstartedCount, stats.learningCount, stats.masteredCount]
  );

  const upcomingSchedule = useMemo(() => {
    return Array.from({ length: 7 }, (_, idx) => {
      const target = addDays(today, idx);
      const iso = format(target, 'yyyy-MM-dd');
      const count = problems.filter((p) => p.nextReviewDate === iso).length;
      return {
        iso,
        weekday: format(target, 'EEE'),
        label: format(target, 'MM-dd'),
        count,
      };
    });
  }, [problems, today]);

  const activitySeries = useMemo(() => {
    const days = Array.from({ length: 21 }, (_, idx) => sub(today, { days: 20 - idx }));
    return days.map((day) => {
      const iso = format(day, 'yyyy-MM-dd');
      const learned = problems.reduce(
        (sum, p) => sum + p.learnHistory.filter((item) => format(parseISO(item.date), 'yyyy-MM-dd') === iso).length,
        0
      );
      const reviewed = problems.reduce(
        (sum, p) => sum + p.reviewHistory.filter((item) => format(parseISO(item.date), 'yyyy-MM-dd') === iso).length,
        0
      );
      return {
        date: format(day, 'MM-dd'),
        learned,
        reviewed,
      };
    });
  }, [problems, today]);

  const todayLearned = useMemo(
    () =>
      problems.reduce((sum, p) => sum + p.learnHistory.filter(item => format(parseISO(item.date), 'yyyy-MM-dd') === todayStr).length, 0),
    [problems, todayStr]
  );

  const todayReviewed = useMemo(
    () =>
      problems.reduce((sum, p) => sum + p.reviewHistory.filter(item => format(parseISO(item.date), 'yyyy-MM-dd') === todayStr).length, 0),
    [problems, todayStr]
  );

  const focusedProblem = useMemo(
    () => problems.find((problem) => problem.id === focusedProblemId) ?? null,
    [problems, focusedProblemId]
  );

  const filteredProblems = useMemo(
    () =>
      problems.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          String(p.id).includes(search.trim())
      ),
    [problems, search]
  );

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

  const updateProblem = (id, updater) => {
    setProblems((prev) => prev.map((problem) => (problem.id === id ? updater(problem) : problem)));
  };

  const completeProblem = (id, action) => {
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
      const rawGlobalData = localStorage.getItem(STORAGE_KEY);
      const globalUserData = rawGlobalData ? JSON.parse(rawGlobalData) : {};
      const problemToUpdate = globalUserData[id];

      if (!problemToUpdate) {
        toast({ title: '题目不存在', status: 'error', duration: 2000, isClosable: true });
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
  };

  const handleAddSolution = (problemId, payload) => {
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
  };

  const handleDeleteSolution = (problemId, solutionId) => {
    updateProblem(problemId, (problem) => ({
      ...problem,
      solutions: problem.solutions.filter((solution) => solution.id !== solutionId),
    }));
  };

  const handleOpenSolutions = (problemId) => {
    setFocusedProblemId(problemId);
  };

  const handleCloseSolutions = () => {
    setFocusedProblemId(null);
  };

  const handleExportData = () => {
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
  };

  const handleImportData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const dataToImport = JSON.parse(data); // 验证 JSON 格式

        // 导入数据就是简单地用新数据覆盖旧的全局存档
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToImport));
        toast({ title: t('toast.importSuccess'), status: 'success', duration: 2000 });
      } catch (error) {
        console.error("Failed to import data:", error);
        toast({ title: t('toast.importError'), status: 'error', duration: 3000 });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: t('toast.clearSuccess'), status: 'warning', duration: 2000 });
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleUndo = (historyItem) => {
    const { problem, type, date } = historyItem;

    updateProblem(problem.id, (p) => {
      if (type === 'learn') {
        const newLearnHistory = p.learnHistory.filter(item => (typeof item === 'string' ? item : item.date) !== date);
        // 核心修正：如果这是最后一次学习记录，则级联删除所有复习记录
        if (newLearnHistory.length === 0) {
          return {
            ...p,
            status: 'unstarted',
            learnHistory: [],
            reviewHistory: [], // 级联删除
            reviewCycleIndex: 0,
            nextReviewDate: null
          };
        }
        return { ...p, learnHistory: newLearnHistory };
      }

      if (type === 'review') {
        const newReviewHistory = p.reviewHistory.filter(item => (typeof item === 'string' ? item : item.date) !== date);
        const newReviewCycleIndex = Math.max(0, p.reviewCycleIndex - 1);
        // 撤销后，下一次复习时间应该基于上一次的活动日期
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
      title: `"${problem.name}" 的一次${type === 'learn' ? '学习' : '复习'}记录已撤销`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleUpdateDate = (historyItem, newDateTime) => {
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

      // 重新计算下一次复习日期
      const lastActionDate = newHistory.length > 0 ? newHistory[newHistory.length - 1].date : new Date();
      const reviewCycleIdx = p.reviewCycleIndex > 0 ? p.reviewCycleIndex : 0;
      const nextReviewDate = format(
        addDays(new Date(lastActionDate), REVIEW_INTERVALS[reviewCycleIdx]),
        'yyyy-MM-dd'
      );

      return { ...p, [historyField]: newHistory, nextReviewDate };
    });

    toast({
      title: `"${problem.name}" 的记录已更新`,
      description: "后续的复习计划也已自动调整。",
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh" transition="background-color 0.3s ease">
      <Box
        bg={headerBg}
        shadow="sm"
        borderBottom="1px solid"
        borderColor={border}
        px={{ base: 4, md: 8 }}
        transition="background-color 0.3s ease, border-color 0.3s ease"
      >
        <Flex direction="row" justify="space-between" align="center" h="72px">
          {/* Left Side */}
          <Box
            as={Link}
            to="/"
            animation={`${titleAnimation} 6s ease-in-out infinite`}
            _hover={{
              animationPlayState: 'paused',
              transform: 'scale(1.05) rotate(0deg)',
              textDecoration: 'none',
            }}
          >
            <Heading
              size="md"
              bgGradient="linear(to-r, teal.500, cyan.500)"
              bgClip="text"
              fontWeight="extrabold"
            >
              {t('header.title')}
            </Heading>
          </Box>

          {/* Right Side */}
          <HStack spacing={6}>
            <HStack spacing={3}>
              <NavLink to="/">{t('tabs.dashboard')}</NavLink>
              <NavLink to="/problems">{t('tabs.problems')}</NavLink>
              <NavLink to="/history">{t('tabs.history')}</NavLink>
            </HStack>
            <HStack spacing={3}>
              <Tag size="sm" colorScheme="teal" variant="subtle">
                {t('header.newToday', { count: todayLearned })}
              </Tag>
              <Tag size="sm" colorScheme="cyan" variant="subtle">
                {t('header.reviewToday', { count: todayReviewed })}
              </Tag>
              <Button
                leftIcon={<AddIcon boxSize={3} />}
                colorScheme="teal"
                variant="solid"
                bg={buttonBg}
                color={buttonColor}
                _hover={{
                  bg: useColorModeValue('teal.100', 'whiteAlpha.300'),
                  transform: 'scale(1.05)',
                }}
                _active={{
                  transform: 'scale(0.95)',
                }}
                size="sm"
                onClick={newSolveModal.onOpen}
                transition="transform 0.1s ease-out"
              >
                {t('header.addNewSolve')}
              </Button>
              <IconButton
                aria-label="Settings"
                icon={<SettingsIcon />}
                onClick={settingsModal.onOpen}
                variant="ghost"
                size="sm"
                transition="transform 0.2s ease-in-out"
                _hover={{
                  transform: 'scale(1.1)',
                }}
                _active={{
                  transform: 'scale(0.9) rotate(90deg)',
                }}
              />
            </HStack>
          </HStack>
        </Flex>
      </Box>

      <Box w="100%" overflow="hidden" position="relative" flex="1" display="flex">
        <AnimatePresence mode="wait" initial={false}>
          <MotionBox
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            transition={pageTransition}
            w="100%"
            style={{ willChange: 'transform, opacity, filter' }}
            flex="1"
            display="flex"
            flexDirection="column"
          >
          <Box w="100%" px={{ base: 4, md: 8 }} py={6}>
            <Routes location={location}>
              <Route
                path="/"
                element={
                  <Dashboard
                    todayStr={todayStr}
                    stats={stats}
                    progressPie={progressPie}
                    toReviewToday={toReviewToday}
                    toReviewTomorrow={toReviewTomorrow}
                    suggestions={newSuggestions}
                    upcomingSchedule={upcomingSchedule}
                    activitySeries={activitySeries}
                    onRecordReview={(id) => completeProblem(id, 'review')}
                    onRecordNew={(id) => completeProblem(id, 'new')}
                    masteredProblems={masteredProblems}
                    onAddSolution={handleAddSolution}
                    onDeleteSolution={handleDeleteSolution}
                  />
                }
              />
              <Route
                path="/problems"
                element={
                  <ProblemsBoard
                    problems={filteredProblems}
                    search={search}
                    setSearch={setSearch}
                    onOpenSolutions={handleOpenSolutions}
                  />
                }
              />
              <Route path="/history" element={<HistoryBoard historyData={historyData} onUndo={handleUndo} onOpenSolutions={handleOpenSolutions} onUpdateDate={handleUpdateDate} />} />
            </Routes>
          </Box>
          </MotionBox>
        </AnimatePresence>
      </Box>

      <SolutionDrawer
        problem={focusedProblem}
        isOpen={Boolean(focusedProblem)}
        onClose={handleCloseSolutions}
        onAddSolution={handleAddSolution}
        onDeleteSolution={handleDeleteSolution}
      />

      <NewSolveModal
        isOpen={newSolveModal.isOpen}
        onClose={newSolveModal.onClose}
        problems={problems}
        onConfirm={(id) => completeProblem(id, 'new')}
      />

      <SettingsModal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.onClose}
        onExport={handleExportData}
        onImport={handleImportData}
        onClear={handleClearData}
        studyPlans={studyPlans}
        currentPlanSlug={currentPlanSlug}
        onSelectPlan={handleSelectPlan}
      />
    </Box>
  );
}

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Flex
      as={Link}
      to={to}
      position="relative"
      px={3}
      h="32px"
      justify="center"
      align="center"
      color={isActive ? 'inherit' : inactiveColor}
      fontWeight={isActive ? 'bold' : 'medium'}
      _hover={{ textDecoration: 'none', color: useColorModeValue('black', 'white') }}
      transition="color 0.3s ease"
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="underline"
          style={{
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(to right, #4FD1C5, #38B2AC)',
            borderRadius: '2px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </Flex>
  );
};

export default App;