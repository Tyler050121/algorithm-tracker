import { Box, Flex } from '@chakra-ui/react';
import { useProblems } from '../context/ProblemContext';
import { useDashboardStats } from '../hooks/useDashboardStats';
import GreetingCard from '../components/dashboard/GreetingCard';
import AchievementsCard from '../components/dashboard/AchievementsCard';
import ScheduleCard from '../components/dashboard/ScheduleCard';
import ReviewListCard from '../components/dashboard/ReviewListCard';
import SuggestionsCard from '../components/dashboard/SuggestionsCard';
import ActivityChartCard from '../components/dashboard/ActivityChartCard';
import CoverageCard from '../components/dashboard/CoverageCard';
import DifficultyDistributionCard from '../components/dashboard/DifficultyDistributionCard';

function Dashboard({ onOpenSolutions }) {
  const { completeProblem } = useProblems();
  const {
    todayStr,
    streak,
    isFrozen,
    progressPie,
    toReviewToday,
    suggestions,
    upcomingSchedule,
    activitySeries,
    achievements,
    todayActivityCount,
    overdueCount,
    difficultyStats,
  } = useDashboardStats();

  const onRecordReview = (id) => completeProblem(id, 'review');
  const onRecordNew = (id) => completeProblem(id, 'new');

  return (
    <Flex 
      h="100%" 
      gap={6} 
      overflowY={{ base: 'auto', xl: 'hidden' }} 
      overflowX="hidden" 
      direction={{ base: 'column', xl: 'row' }}
    >
      
      {/* Left Column: Greeting/Achievements, Schedule, Review */}
      <Flex direction="column" flex={{ base: 'none', xl: 3 }} gap={6} overflow={{ base: 'visible', xl: 'hidden' }}>
        
        {/* Row 1: Greeting & Achievements */}
        <Flex gap={4} flex={{ base: 'none', xl: 2.2 }} minH={{ base: '160px', xl: 0 }} shrink={0} direction={{ base: 'column', lg: 'row' }}>
            <Box flex={1} h="full">
              <GreetingCard 
                streak={streak} 
                isFrozen={isFrozen} 
                todayActivityCount={todayActivityCount} 
                overdueCount={overdueCount} 
              />
            </Box>
            <Box flex={1.5} h="full">
              <AchievementsCard achievements={achievements} />
            </Box>
        </Flex>

        {/* Row 2: Schedule */}
        <ScheduleCard schedule={upcomingSchedule} />

        {/* Row 3: Review List (Flex 1) */}
        <ReviewListCard 
          toReviewToday={toReviewToday} 
          onRecordReview={onRecordReview} 
          onOpenSolutions={onOpenSolutions} 
          todayStr={todayStr} 
        />
      </Flex>

      {/* Right Column: Suggestions & Charts */}
      <Flex direction="column" flex={{ base: 'none', xl: 2 }} gap={6} overflow={{ base: 'visible', xl: 'hidden' }}>
         
         {/* Row 1: Suggestions */}
         <SuggestionsCard 
           suggestions={suggestions} 
           onOpenSolutions={onOpenSolutions} 
           onRecordNew={onRecordNew} 
         />

         {/* Row 2: Charts Area (Activity Line Chart) */}
         <ActivityChartCard activitySeries={activitySeries} />
         
         {/* Row 3: Coverage Pie & Difficulty Distribution */}
         <Flex gap={4} flex={{ base: 'none', xl: 2 }} minH={{ base: '140px', xl: 0 }}>
             <CoverageCard progressPie={progressPie} />
             <DifficultyDistributionCard difficultyStats={difficultyStats} />
         </Flex>

      </Flex>
    </Flex>
  );
}

export default Dashboard;
