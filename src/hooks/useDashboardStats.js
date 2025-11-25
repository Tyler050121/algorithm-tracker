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

  const streakData = useMemo(() => {
    const allActivityDates = new Set();
    problems.forEach(p => {
      (p.learnHistory || []).forEach(h => allActivityDates.add(format(parseISO(h.date), 'yyyy-MM-dd')));
      (p.reviewHistory || []).forEach(h => allActivityDates.add(format(parseISO(h.date), 'yyyy-MM-dd')));
    });

    const sortedDates = [...allActivityDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (sortedDates.length === 0) {
      return { count: 0, isFrozen: false };
    }

    const todayFormatted = format(today, 'yyyy-MM-dd');
    const yesterdayFormatted = format(sub(today, { days: 1 }), 'yyyy-MM-dd');
    const twoDaysAgoFormatted = format(sub(today, { days: 2 }), 'yyyy-MM-dd');

    let isFrozen = false;

    // Check if streak is broken or frozen
    if (sortedDates[0] === todayFormatted) {
       // Active today
    } else if (sortedDates[0] === yesterdayFormatted) {
       // Active yesterday
    } else if (sortedDates[0] === twoDaysAgoFormatted) {
       // Missed yesterday -> Frozen
       isFrozen = true;
    } else {
       // Broken
       return { count: 0, isFrozen: false };
    }

    let currentStreak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = parseISO(sortedDates[i]);
      const nextDate = parseISO(sortedDates[i + 1]);
      const diffInDays = Math.round((currentDate.getTime() - nextDate.getTime()) / (1000 * 3600 * 24));
      
      if (diffInDays === 1) {
        currentStreak++;
      } else if (diffInDays === 2 && i === 0 && sortedDates[0] === todayFormatted) {
        // Special case: Recovering today from a missed yesterday
        // We allow this gap to bridge the streak
      } else {
        break;
      }
    }

    return { count: currentStreak, isFrozen };
  }, [problems, today]);

  const streak = streakData.count;
  const isFrozen = streakData.isFrozen;

  const todayActivityCount = useMemo(() => {
    const todayFormatted = format(today, 'yyyy-MM-dd');
    let count = 0;
    problems.forEach(p => {
      (p.learnHistory || []).forEach(h => {
        if (format(parseISO(h.date), 'yyyy-MM-dd') === todayFormatted) count++;
      });
      (p.reviewHistory || []).forEach(h => {
        if (format(parseISO(h.date), 'yyyy-MM-dd') === todayFormatted) count++;
      });
    });
    return count;
  }, [problems, today]);

  const achievements = useMemo(() => {
    const list = [
      {
        id: 'streak_3',
        icon: '🔥',
        title: t('dashboard.achievements.streak_3.title', 'Streak Novice'),
        desc: t('dashboard.achievements.streak_3.desc', 'Reach a 3-day streak'),
        unlocked: streak >= 3,
      },
      {
        id: 'streak_7',
        icon: '⚡',
        title: t('dashboard.achievements.streak_7.title', 'Streak Master'),
        desc: t('dashboard.achievements.streak_7.desc', 'Reach a 7-day streak'),
        unlocked: streak >= 7,
      },
      {
        id: 'streak_21',
        icon: '🏆',
        title: t('dashboard.achievements.streak_21.title', 'Habit Builder'),
        desc: t('dashboard.achievements.streak_21.desc', 'Reach a 21-day streak'),
        unlocked: streak >= 21,
      },
      {
        id: 'daily_5',
        icon: '💪',
        title: t('dashboard.achievements.daily_5.title', 'Daily Grinder'),
        desc: t('dashboard.achievements.daily_5.desc', 'Complete 5 activities in a day'),
        unlocked: todayActivityCount >= 5,
      },
      {
        id: 'master_10',
        icon: '🧠',
        title: t('dashboard.achievements.master_10.title', 'Problem Solver'),
        desc: t('dashboard.achievements.master_10.desc', 'Master 10 problems'),
        unlocked: stats.masteredCount >= 10,
      },
      {
        id: 'master_50',
        icon: '🎓',
        title: t('dashboard.achievements.master_50.title', 'Expert'),
        desc: t('dashboard.achievements.master_50.desc', 'Master 50 problems'),
        unlocked: stats.masteredCount >= 50,
      },
    ];
    return list;
  }, [streak, todayActivityCount, stats.masteredCount, t]);

  const overdueCount = useMemo(() => {
    return problems.filter(
      (p) =>
        p.nextReviewDate &&
        isBefore(new Date(p.nextReviewDate), today) &&
        p.status !== 'mastered'
    ).length;
  }, [problems, today]);

  // 难度分布统计 - 基于总题库
  const difficultyStats = useMemo(() => {
    const easyAll = problems.filter(p => p.difficulty?.toLowerCase() === 'easy');
    const mediumAll = problems.filter(p => p.difficulty?.toLowerCase() === 'medium');
    const hardAll = problems.filter(p => p.difficulty?.toLowerCase() === 'hard');
    
    const calcStats = (arr, color, lightColor) => {
      const total = arr.length;
      const learning = arr.filter(p => p.status === 'learning').length;
      const mastered = arr.filter(p => p.status === 'mastered').length;
      const done = learning + mastered;
      return {
        total,
        learning,
        mastered,
        done,
        color,
        lightColor,
        percent: total > 0 ? Math.round((done / total) * 100) : 0,
        learningPercent: total > 0 ? (learning / total) * 100 : 0,
        masteredPercent: total > 0 ? (mastered / total) * 100 : 0,
      };
    };
    
    return [
      { name: 'Easy', ...calcStats(easyAll, '#48BB78', '#9AE6B4') },
      { name: 'Medium', ...calcStats(mediumAll, '#ED8936', '#FBD38D') },
      { name: 'Hard', ...calcStats(hardAll, '#F56565', '#FEB2B2') },
    ];
  }, [problems]);

  return {
    todayStr,
    stats,
    streak,
    isFrozen,
    masteredProblems,
    toReviewToday,
    toReviewTomorrow,
    suggestions,
    progressPie,
    upcomingSchedule,
    activitySeries,
    achievements,
    todayActivityCount,
    overdueCount,
    difficultyStats,
  };
};
