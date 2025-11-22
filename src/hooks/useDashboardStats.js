import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isBefore, addDays, startOfToday, format, sub, parseISO } from 'date-fns';
import { useProblems } from '../context/ProblemContext';

export const useDashboardStats = () => {
  const { t } = useTranslation();
  const { problems } = useProblems();
  const today = startOfToday();
  const todayStr = format(today, 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');

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

  const suggestions = useMemo(
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

  return {
    todayStr,
    stats,
    masteredProblems,
    toReviewToday,
    toReviewTomorrow,
    suggestions,
    progressPie,
    upcomingSchedule,
    activitySeries,
  };
};
