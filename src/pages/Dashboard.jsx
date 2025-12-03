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
import ScrollReveal from '../components/common/ScrollReveal';

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
        <ScrollReveal animation="fade" stagger={1} flex={{ base: 'none', xl: 2.2 }} minH={{ base: '160px', xl: 0 }} flexShrink={0}>
          <Flex gap={4} h="full" direction={{ base: 'column', lg: 'row' }}>
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
        </ScrollReveal>

        {/* Row 2: Schedule */}
        <ScrollReveal animation="slide" stagger={2} flexShrink={0}>
          <ScheduleCard schedule={upcomingSchedule} w="100%" />
        </ScrollReveal>

        {/* Row 3: Review List (Flex 1) */}
        <ScrollReveal animation="slide" stagger={3} flex={{ base: 'none', xl: 4.8 }} minH={{ base: '500px', xl: 0 }} display="flex" flexDirection="column">
          <ReviewListCard 
            toReviewToday={toReviewToday} 
            onRecordReview={onRecordReview} 
            onOpenSolutions={onOpenSolutions} 
            todayStr={todayStr}
            flex="1"
            minH="0"
          />
        </ScrollReveal>
      </Flex>

      {/* Right Column: Suggestions & Charts */}
      <Flex direction="column" flex={{ base: 'none', xl: 2 }} gap={6} overflow={{ base: 'visible', xl: 'hidden' }}>
         
         {/* Row 1: Suggestions */}
         <ScrollReveal animation="fade" stagger={1} flex={{ base: 'none', xl: 1.5 }} minH="300px" display="flex" flexDirection="column">
           <SuggestionsCard 
             suggestions={suggestions} 
             onOpenSolutions={onOpenSolutions} 
             onRecordNew={onRecordNew}
             flex="1"
             minH="0"
           />
         </ScrollReveal>

         {/* Row 2: Charts Area (Activity Line Chart) */}
         <ScrollReveal animation="blur" stagger={2} flex={{ base: 'none', xl: 3 }} minH={{ base: '140px', xl: 0 }} display="flex" flexDirection="column">
           <ActivityChartCard activitySeries={activitySeries} flex="1" minH="0" />
         </ScrollReveal>
         
         {/* Row 3: Coverage Pie & Difficulty Distribution */}
         <ScrollReveal animation="slide" stagger={3} flex={{ base: 'none', xl: 2 }} minH={{ base: '140px', xl: 0 }}>
           <Flex gap={4} h="full">
               <CoverageCard progressPie={progressPie} />
               <DifficultyDistributionCard difficultyStats={difficultyStats} />
           </Flex>
         </ScrollReveal>

      </Flex>
    </Flex>
  );
}

export default Dashboard;
