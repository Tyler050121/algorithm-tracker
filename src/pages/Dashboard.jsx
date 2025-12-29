import React, { useContext, useState, useEffect } from 'react';
import { Flex, HStack, Box, Text, Badge, IconButton, useColorModeValue } from '@chakra-ui/react';
import { useProblems } from '../context/ProblemContext';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { MainLayoutContext } from '../context/MainLayoutContext';
import ProblemListCard from '../components/dashboard/ProblemListCard';
import OverviewPanel from '../components/dashboard/OverviewPanel';
import ScrollReveal from '../components/common/ScrollReveal';
import { RepeatIcon, SunIcon, CheckIcon, AddIcon } from '@chakra-ui/icons';
import { LuRocket, LuCheck, LuLayers } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';

const UpcomingReviewDots = ({ schedule, onDateClick, activeDate }) => {
    const activeBg = useColorModeValue("brand.50", "whiteAlpha.100");
    const activeColor = useColorModeValue("brand.500", "brand.300");
    const inactiveColor = useColorModeValue("gray.400", "gray.500");
    
    return (
      <HStack spacing={1} overflowX="auto" py={1} css={{ "&::-webkit-scrollbar": { display: "none" } }}>
        {schedule.map((day) => {
          const hasReview = day.count > 0;
          const isActive = day.iso === activeDate;
          
          return (
              <Flex 
                key={day.iso}
                direction="column"
                align="center"
                justify="center"
                minW="32px"
                h="40px"
                borderRadius="md"
                bg={isActive ? activeBg : "transparent"}
                cursor="pointer"
                transition="all 0.2s"
                onClick={() => onDateClick(day.iso)}
              >
                 <Text fontSize="9px" fontWeight="bold" textTransform="uppercase" mb="1px" color={isActive ? activeColor : inactiveColor}>
                    {day.weekday}
                 </Text>
                 <Text fontSize="xs" fontWeight={isActive ? "extrabold" : "medium"} color={isActive ? activeColor : inactiveColor}>
                    {day.label.split('-')[1]}
                 </Text>
                 {hasReview && !isActive && (
                     <Box w="3px" h="3px" borderRadius="full" bg="brand.400" mt="1px" />
                 )}
              </Flex>
          )
        })}
      </HStack>
    )
};

function Dashboard({ onOpenSolutions }) {
  const { t } = useTranslation();
  const { completeProblem } = useProblems();
  const { onOpenNewSolve } = useContext(MainLayoutContext);
  
  const {
    streak,
    isFrozen,
    toReviewToday,
    suggestions,
    upcomingSchedule,
    overdueCount,
    difficultyStats,
    activitySeries,
  } = useDashboardStats();

  const onRecordReview = (id) => completeProblem(id, 'review');
  const onRecordNew = (id) => completeProblem(id, 'new');

  const [activeDate, setActiveDate] = useState(upcomingSchedule[0]?.iso);

  useEffect(() => {
    if (upcomingSchedule.length > 0 && !activeDate) {
        setActiveDate(upcomingSchedule[0].iso);
    }
  }, [upcomingSchedule, activeDate]);

  const handleDateClick = (iso) => {
    // Scroll only, active state update is handled by IntersectionObserver in ProblemListCard
    const element = document.getElementById(`review-group-${iso}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Flex 
      h="100%" 
      gap={6} 
      overflowY={{ base: 'auto', xl: 'hidden' }} 
      overflowX="hidden" 
      direction={{ base: 'column', xl: 'row' }}
      p={{ base: 4, xl: 0 }}
    >
      
      {/* Left Column: Greeting, Stats */}
      <Flex direction="column" flex={{ base: 'none', xl: 3 }} gap={6} overflow={{ base: 'visible', xl: 'hidden' }}>
        
        <ScrollReveal animation="fade" stagger={1} flex="1" overflowY="auto" pr={1} css={{ "&::-webkit-scrollbar": { display: "none" } }}>
           <OverviewPanel 
             streak={streak}
             isFrozen={isFrozen}
             overdueCount={overdueCount}
             difficultyStats={difficultyStats}
             activitySeries={activitySeries}
           />
        </ScrollReveal>

      </Flex>

      {/* Right Column: Suggestions (30%), Review List (70%) */}
      <Flex direction="column" flex={{ base: 'none', xl: 2 }} gap={6} overflow={{ base: 'visible', xl: 'hidden' }}>

         {/* Row 1: Suggestions (40%) */}
         <ScrollReveal animation="fade" stagger={1} flex="4" minH="160px" display="flex" flexDirection="column">
            <ProblemListCard
             title={t('dashboard.suggestions.title')}
             subtitle={t('dashboard.suggestions.subtitle', 'Recommended')}
             icon={SunIcon}
             iconBg="orange.50"
             iconColor="orange.500"
             problems={suggestions.slice(0, 3)}
             onOpenSolutions={onOpenSolutions}
             onAction={onRecordNew}
             actionIcon={<LuRocket />}
             enableLongPress={true}
             actionLabel={t('dashboard.review.done', 'Done')}
             actionColorScheme="gray"
             emptyText={t('dashboard.suggestions.empty')}
             headerRight={
                <HStack spacing={2}>
                    <Badge colorScheme="orange" variant="solid" borderRadius="full" px={2} fontSize="0.7em">
                        {t('dashboard.suggestions.badgeTop')}
                    </Badge>
                    <IconButton
                        icon={<AddIcon />}
                        size="xs"
                        isRound
                        variant="ghost"
                        colorScheme="gray"
                        aria-label={t('header.addNewSolve')}
                        onClick={onOpenNewSolve}
                        _hover={{ bg: 'blackAlpha.50', transform: 'scale(1.1)' }}
                        transition="all 0.2s"
                    />
                </HStack>
             }
           />
         </ScrollReveal>
         
         {/* Row 2: Review Schedule (60%) */}
         <ScrollReveal animation="slide" stagger={2} flex="6" minH="300px" display="flex" flexDirection="column">
           <ProblemListCard 
             title={t('dashboard.review.listTitle')}
             // subtitle={t('dashboard.review.countBadge', { count: toReviewToday.length }) + ' pending'}
             icon={RepeatIcon}
             iconBg="blue.50"
             iconColor="blue.500"
             problems={[
                { 
                    label: (
                        <HStack spacing={2} align="baseline">
                            <Text fontWeight="extrabold" fontSize="md" color="brand.500">
                                {t('dashboard.review.todayGroup')}
                            </Text>
                            <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
                                {upcomingSchedule[0]?.weekday}
                            </Text>
                        </HStack>
                    ), 
                    problems: toReviewToday, 
                    id: upcomingSchedule[0]?.iso 
                },
                ...upcomingSchedule.slice(1).map(day => ({
                    label: (
                        <HStack spacing={2} align="baseline">
                            <Text fontWeight="bold" fontSize="sm" color="gray.600">
                                {day.label}
                            </Text>
                            <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
                                {day.weekday}
                            </Text>
                        </HStack>
                    ),
                    problems: day.problems,
                    id: day.iso
                }))
             ]}
             onOpenSolutions={onOpenSolutions}
             onAction={onRecordReview}
             actionIcon={<LuCheck />}
             enableLongPress={true}
             actionLabel={t('dashboard.review.done', 'Done')}
             actionColorScheme="brand"
             subtitle={t('dashboard.review.subtitle')}
             actionVariant="ghost"
             emptyText={t('dashboard.review.empty')}
             headerExtra={<UpcomingReviewDots schedule={upcomingSchedule} onDateClick={handleDateClick} activeDate={activeDate} />}
             onActiveSectionChange={setActiveDate}
             grouped={true}
           />
         </ScrollReveal>

      </Flex>
    </Flex>
  );
}

export default Dashboard;
