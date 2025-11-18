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
import { format, addDays, isBefore, startOfToday, sub } from 'date-fns';
import { HOT_100_PROBLEMS, REVIEW_INTERVALS } from './constants';
import Dashboard from './components/Dashboard';
import ProblemsBoard from './components/ProblemsBoard';
import SolutionDrawer from './components/SolutionDrawer';
import NewSolveModal from './components/NewSolveModal';
import SettingsModal from './components/SettingsModal';
import HistoryBoard from './components/HistoryBoard';

const STORAGE_KEY = 'algorithmTrackerProblemsV3';
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
    startDate: problem.startDate ?? null,
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

  useEffect(() => {
    const rawUserData = localStorage.getItem(STORAGE_KEY);
    const savedUserData = rawUserData ? JSON.parse(rawUserData) : {};

    const mergedProblems = HOT_100_PROBLEMS.map((baseProblem) => {
      const userData = savedUserData[baseProblem.id] || {};
      const name = t(`problem_names.p_${baseProblem.id}`);
      return normalizeProblem({ ...baseProblem, ...userData, name });
    });

    setProblems(mergedProblems);
  }, [t]);

  useEffect(() => {
    if (problems.length) {
      const userDataToSave = problems.reduce((acc, p) => {
        acc[p.id] = {
          status: p.status,
          startDate: p.startDate,
          nextReviewDate: p.nextReviewDate,
          reviewCycleIndex: p.reviewCycleIndex,
          learnHistory: p.learnHistory,
          reviewHistory: p.reviewHistory,
          solutions: p.solutions,
        };
        return acc;
      }, {});
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userDataToSave));
    }
  }, [problems]);

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
        (sum, p) => sum + p.learnHistory.filter((d) => d === iso).length,
        0
      );
      const reviewed = problems.reduce(
        (sum, p) => sum + p.reviewHistory.filter((d) => d === iso).length,
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
      problems.reduce((sum, p) => sum + p.learnHistory.filter((d) => d === todayStr).length, 0),
    [problems, todayStr]
  );

  const todayReviewed = useMemo(
    () =>
      problems.reduce((sum, p) => sum + p.reviewHistory.filter((d) => d === todayStr).length, 0),
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

  const updateProblem = (id, updater) => {
    setProblems((prev) => prev.map((problem) => (problem.id === id ? updater(problem) : problem)));
  };

  const completeProblem = (id, action) => {
    const problemExists = problems.some((p) => p.id === id);
    if (!problemExists) {
      toast({ title: '题目不存在', status: 'error', duration: 2000, isClosable: true });
      return;
    }

    const now = new Date();
    const nowStr = format(now, 'yyyy-MM-dd');
    const isNew = action === 'new';

    updateProblem(id, (problem) => {
      if (isNew) {
        const nextReviewDate = format(addDays(now, REVIEW_INTERVALS[0]), 'yyyy-MM-dd');
        return {
          ...problem,
          status: 'learning',
          reviewCycleIndex: 0,
          startDate: problem.startDate ?? nowStr,
          nextReviewDate,
          learnHistory: [...problem.learnHistory, nowStr],
        };
      }

      const nextIndex = problem.reviewCycleIndex + 1;
      const reviewHistory = [...problem.reviewHistory, nowStr];

      if (nextIndex >= REVIEW_INTERVALS.length) {
        return {
          ...problem,
          status: 'mastered',
          reviewCycleIndex: REVIEW_INTERVALS.length,
          nextReviewDate: null,
          reviewHistory,
        };
      }

      const nextReviewDate = format(addDays(new Date(), REVIEW_INTERVALS[nextIndex]), 'yyyy-MM-dd');
      return {
        ...problem,
        status: 'learning',
        reviewCycleIndex: nextIndex,
        nextReviewDate,
        reviewHistory,
      };
    });

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
        const importedProblems = JSON.parse(data);

        // 更新状态
        const mergedProblems = HOT_100_PROBLEMS.map((baseProblem) => {
          const userData = importedProblems[baseProblem.id] || {};
          const name = t(`problem_names.p_${baseProblem.id}`);
          return normalizeProblem({ ...baseProblem, ...userData, name });
        });
        setProblems(mergedProblems);

        localStorage.setItem(STORAGE_KEY, data);
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
        const newLearnHistory = p.learnHistory.filter(d => d !== date);
        // 核心修正：如果这是最后一次学习记录，则级联删除所有复习记录
        if (newLearnHistory.length === 0) {
          return {
            ...p,
            status: 'unstarted',
            learnHistory: [],
            reviewHistory: [], // 级联删除
            reviewCycleIndex: 0,
            nextReviewDate: null,
            startDate: null
          };
        }
        return { ...p, learnHistory: newLearnHistory };
      }

      if (type === 'review') {
        const newReviewHistory = p.reviewHistory.filter(d => d !== date);
        const newReviewCycleIndex = Math.max(0, p.reviewCycleIndex - 1);
        const nextReviewDate = date;
        
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

  const handleUpdateDate = (historyItem, newDate) => {
    const { problem, type, date: oldDate } = historyItem;

    updateProblem(problem.id, (p) => {
      const historyField = type === 'learn' ? 'learnHistory' : 'reviewHistory';
      
      // 替换日期并重新排序
      const newHistory = p[historyField].map(d => (d === oldDate ? newDate : d)).sort();
      
      // 重新计算下一次复习日期
      const lastActionDate = newHistory[newHistory.length - 1];
      const nextReviewDate = format(
        addDays(new Date(lastActionDate), REVIEW_INTERVALS[p.reviewCycleIndex]),
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
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh">
      <Box
        bg={headerBg}
        shadow="sm"
        borderBottom="1px solid"
        borderColor={border}
        px={{ base: 4, md: 8 }}
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

      <Box w="100%" overflow="hidden" position="relative">
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
              <Route path="/history" element={<HistoryBoard problems={problems} onUndo={handleUndo} onOpenSolutions={handleOpenSolutions} onUpdateDate={handleUpdateDate} />} />
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