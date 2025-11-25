import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  IconButton,
  Link,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  Tooltip as ChakraTooltip,
  VStack,
  useColorModeValue,
  Progress,
  Heading,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
} from '@chakra-ui/react';
import {
  CalendarIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  AddIcon,
  SunIcon,
  WarningIcon,
  EditIcon,
} from '@chakra-ui/icons';
import { FaFire, FaTrophy, FaSnowflake, FaBookOpen } from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useProblems } from '../context/ProblemContext';
import { useDashboardStats } from '../hooks/useDashboardStats';

const DIFFICULTY_MAP = {
  easy: { label: 'Easy', color: 'green' },
  medium: { label: 'Medium', color: 'orange' },
  hard: { label: 'Hard', color: 'red' },
};

const DifficultyBadge = ({ difficulty, ...props }) => {
  const { t } = useTranslation();
  const safeDifficulty = difficulty?.toLowerCase() || 'unknown';
  const { label, color } = DIFFICULTY_MAP[safeDifficulty] || { label: 'Unknown', color: 'gray' };
  return (
    <Badge colorScheme={color} variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="md" {...props}>
      {t(`dashboard.difficulty.${safeDifficulty}`, label)}
    </Badge>
  );
};

const DayCard = ({ day, isToday }) => {
  const { t } = useTranslation();
  const hasTasks = day.count > 0;

  // Colors
  const defaultBg = useColorModeValue('white', 'gray.700');
  
  const redBg = useColorModeValue('red.50', 'rgba(254, 178, 178, 0.16)');
  const orangeBg = useColorModeValue('orange.50', 'rgba(251, 211, 141, 0.16)');
  const brandBg = useColorModeValue('brand.50', 'rgba(90, 103, 216, 0.16)'); 

  // Border Colors
  const defaultBorderColor = useColorModeValue('gray.200', 'gray.600');

  // Today's special styling
  const todayBg = useColorModeValue('white', 'gray.700');
  const todayBorderColor = useColorModeValue('brand.500', 'brand.400');
  const todayShadow = useColorModeValue('0 4px 12px rgba(90, 103, 216, 0.25)', '0 4px 12px rgba(90, 103, 216, 0.4)');

  let bg = defaultBg;
  let badgeScheme = 'gray';
  let color = 'inherit';
  let borderColor = defaultBorderColor;

  if (hasTasks) {
    if (day.count > 4) {
      bg = redBg;
      badgeScheme = 'red';
      color = 'red.600';
      borderColor = 'red.200';
    } else if (day.count > 2) {
      bg = orangeBg;
      badgeScheme = 'orange';
      color = 'orange.600';
      borderColor = 'orange.200';
    } else {
      bg = brandBg;
      badgeScheme = 'brand';
      color = 'brand.600';
      borderColor = 'brand.200';
    }
  }

  if (isToday) {
    bg = todayBg;
    borderColor = todayBorderColor;
  }

  return (
    <VStack
      bg={bg}
      boxShadow={isToday ? todayShadow : 'none'}
      borderWidth={isToday ? '2px' : '1px'}
      borderColor={borderColor}
      borderRadius="xl"
      py={3}
      px={2}
      spacing={2}
      align="center"
      position="relative"
      transition="all 0.3s ease"
      _hover={{ transform: 'translateY(-2px)', shadow: 'md', borderColor: isToday ? todayBorderColor : 'brand.400' }}
      role="group"
      cursor="default"
      h="100%"
      justify="space-between"
      opacity={!isToday && !hasTasks ? 0.7 : 1}
    >
      {isToday && (
        <Badge
          position="absolute"
          top="-3"
          colorScheme="brand"
          variant="solid"
          fontSize="0.6rem"
          borderRadius="full"
          px={2}
          py={0.5}
          boxShadow="sm"
          zIndex={1}
        >
          TODAY
        </Badge>
      )}
      
      <VStack spacing={1} align="center" mt={1}>
        <Text fontSize="10px" fontWeight="bold" textTransform="uppercase" color="gray.500" letterSpacing="wider">
          {day.weekday}
        </Text>
        
        <Text fontSize="xl" fontWeight="extrabold" lineHeight="1" color={isToday ? 'brand.500' : color}>
          {day.label}
        </Text>
      </VStack>

      <Flex h="20px" align="center" justify="center" w="full">
        <Badge 
          colorScheme={badgeScheme} 
          variant={hasTasks ? "subtle" : "outline"} 
          borderRadius="full" 
          px={2} 
          fontSize="xs" 
          textTransform={hasTasks ? "none" : "uppercase"}
          opacity={hasTasks ? 1 : 0.5}
        >
           {hasTasks ? `${day.count} ${t('dashboard.problems', 'Tasks')}` : 'Free'}
        </Badge>
      </Flex>
    </VStack>
  );
};

const TooltipContent = ({ problems }) => {
  const { i18n } = useTranslation();
  if (!problems || problems.length === 0) {
    return null;
  }
  return (
    <VStack align="stretch" spacing={2} p={1}>
      {problems.slice(0, 5).map((p) => (
        <HStack key={p.id} justify="space-between">
          <Text fontSize="xs">
            #{p.id} {(i18n.language === 'zh' ? p.title.zh : p.title.en) || p.title.en}
          </Text>
          <DifficultyBadge difficulty={p.difficulty} />
        </HStack>
      ))}
      {problems.length > 5 && <Text fontSize="xs">...and {problems.length - 5} more.</Text>}
    </VStack>
  );
};

import { useAppTheme } from '../context/ThemeContext';

const MotionBox = motion(Box);

const GreetingCard = ({ streak, isFrozen, todayActivityCount, overdueCount }) => {
  const { t } = useTranslation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning', 'Good Morning');
    if (hour < 18) return t('dashboard.greeting.afternoon', 'Good Afternoon');
    return t('dashboard.greeting.evening', 'Good Evening');
  };

  // Determine Streak Visuals
  let streakIcon = FaFire;
  let streakColor = "orange.500";
  let streakGradient = "radial(orange.400, transparent 70%)";
  let streakTextGradient = "linear(to-r, orange.400, red.500)";
  let streakLabel = t('dashboard.welcome.streak', 'Streak');

  if (isFrozen) {
    streakIcon = FaSnowflake;
    streakColor = "cyan.400";
    streakGradient = "radial(cyan.400, transparent 70%)";
    streakTextGradient = "linear(to-r, cyan.400, blue.500)";
    streakLabel = t('dashboard.welcome.streakFrozen', 'Frozen');
  } else if (overdueCount > 0) {
    streakIcon = WarningIcon;
    streakColor = "red.500";
    streakGradient = "radial(red.400, transparent 70%)";
    streakTextGradient = "linear(to-r, red.500, red.600)";
  }

  return (
    <Box 
      bg={bg} 
      p={6} 
      borderRadius="2xl" 
      boxShadow="sm" 
      border="1px solid" 
      borderColor={borderColor}
      position="relative"
      overflow="hidden"
      h="100%"
    >
      {overdueCount > 0 && (
        <Badge 
          position="absolute" 
          top={4} 
          right={4} 
          colorScheme="red" 
          variant="solid" 
          borderRadius="full" 
          px={3} 
          py={1}
          fontSize="xs"
          zIndex={2}
        >
          ⚠️ {overdueCount} {t('dashboard.welcome.overdueTasks', 'Overdue Tasks')}
        </Badge>
      )}
      <VStack align="start" spacing={4} h="full" justify="center">
        <Box>
          <Heading size="md" fontWeight="bold">
            {getGreeting()}, <Text as="span" color="brand.500">User</Text>!
          </Heading>
          <Text color="gray.500" fontSize="sm">
            {t('dashboard.welcome.subtitle', 'Ready to solve some problems?')}
          </Text>
        </Box>

        <HStack spacing={6} w="full" align="center">
          <Box position="relative" mt={1}>
            {/* Fire/Ice Effect Glow */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="60px"
              h="60px"
              borderRadius="full"
              bgGradient={streakGradient}
              opacity={0.6}
              filter="blur(10px)"
              animation="pulse-glow 2s infinite"
              sx={{
                '@keyframes pulse-glow': {
                  '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.6 },
                  '50%': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0.8 },
                  '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.6 },
                }
              }}
            />
            <Icon 
              as={streakIcon} 
              w={12} h={12} 
              color={streakColor} 
              position="relative"
              zIndex={1}
            />
          </Box>
          
          <VStack align="start" spacing={0}>
              <Text fontSize="4xl" fontWeight="900" lineHeight="1" bgGradient={streakTextGradient} bgClip="text">
                {streak}
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                {t('dashboard.stats.days')} {streakLabel}
              </Text>
          </VStack>

          <Box w="1px" h="40px" bg="gray.200" />

          <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  {todayActivityCount}
              </Text>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  {t('dashboard.welcome.activities', 'Activities')}
              </Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};

const AchievementsCard = ({ achievements }) => {
  const { t } = useTranslation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const nextAchievement = achievements.find(a => !a.unlocked);

  return (
    <Box 
      bg={bg} 
      p={5} 
      borderRadius="2xl" 
      boxShadow="sm" 
      border="1px solid" 
      borderColor={borderColor}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      h="100%"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <HStack>
          <Icon as={FaTrophy} color="yellow.500" />
          <Text fontSize="sm" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
            {t('dashboard.achievements.title', 'Achievements')}
          </Text>
          <Badge colorScheme="gray" fontSize="xs" borderRadius="full">{unlockedCount}/{achievements.length}</Badge>
        </HStack>
        {nextAchievement && (
          <HStack spacing={1}>
              <Text fontSize="xs" color="gray.400">{t('dashboard.achievements.nextGoal', 'Next Goal')}:</Text>
              <Text fontSize="xs" color="brand.500" fontWeight="bold" noOfLines={1} maxW="100px">
                {nextAchievement.title}
              </Text>
          </HStack>
        )}
      </Flex>
      
      <Box position="relative" w="full" flex={1} overflow="hidden">
          <HStack 
            spacing={4} 
            overflowX="auto" 
            py={1} 
            px={1}
            h="full"
            align="center"
            css={{ 
                '&::-webkit-scrollbar': { height: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#E2E8F0', borderRadius: '2px' },
            }}
          >
            {achievements.map((achievement) => (
              <ChakraTooltip 
                key={achievement.id} 
                label={
                  <VStack align="start" spacing={0} p={1}>
                    <Text fontWeight="bold" fontSize="sm">{achievement.title}</Text>
                    <Text fontSize="xs">{achievement.desc}</Text>
                    {!achievement.unlocked && <Text fontSize="xs" color="red.300">Locked</Text>}
                  </VStack>
                } 
                hasArrow
                placement="top"
              >
                <Flex
                  minW={10} h={10}
                  borderRadius="xl"
                  bg={achievement.unlocked ? 'brand.50' : 'gray.100'}
                  color={achievement.unlocked ? 'brand.500' : 'gray.400'}
                  align="center" justify="center"
                  border="1px solid"
                  borderColor={achievement.unlocked ? 'brand.200' : 'transparent'}
                  opacity={achievement.unlocked ? 1 : 0.6}
                  filter={achievement.unlocked ? 'none' : 'grayscale(100%)'}
                  transition="all 0.2s"
                  _hover={{ transform: 'translateY(-2px)', borderColor: 'brand.300', shadow: 'sm' }}
                  cursor="default"
                  flexShrink={0}
                >
                  <Text fontSize="lg">{achievement.icon}</Text>
                </Flex>
              </ChakraTooltip>
            ))}
          </HStack>
      </Box>
    </Box>
  );
};

function Dashboard({ onOpenSolutions }) {
  const { t, i18n } = useTranslation();
  const { completeProblem } = useProblems();
  const { colorScheme, schemes } = useAppTheme();
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

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.100', 'gray.700');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  const reviewHoverBg = useColorModeValue('white', 'gray.700');
  const suggestionHoverBg = useColorModeValue('orange.50', 'whiteAlpha.100');
  const learnedColor = useColorModeValue(schemes[colorScheme].colors.brand[500], schemes[colorScheme].colors.brand[300]);
  const reviewedColor = useColorModeValue(schemes[colorScheme].colors.accent[500], schemes[colorScheme].colors.accent[300]);

  const translatedProgressPie = progressPie.map(item => ({
    ...item,
    name: t(`dashboard.charts.pieLabels.${item.name.toLowerCase()}`, item.name),
  }));

  const pieColors = useColorModeValue(
    [schemes[colorScheme].colors.brand[200], schemes[colorScheme].colors.brand[500], schemes[colorScheme].colors.brand[800]], 
    [schemes[colorScheme].colors.brand[700], schemes[colorScheme].colors.brand[400], schemes[colorScheme].colors.brand[200]]
  );

  const diffHoverBg = useColorModeValue('gray.50', 'gray.700');
  const diffProgressBg = useColorModeValue('gray.100', 'gray.600');
  const diffPopoverBg = useColorModeValue('white', 'gray.700');
  const diffPopoverBorder = useColorModeValue('gray.100', 'gray.600');

  const CustomPieTooltip = ({ active, payload }) => {
    const bg = useColorModeValue('white', 'gray.700');
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box bg={bg} p={3} borderRadius="lg" boxShadow="xl" fontSize="sm">
          <Text>{`${data.name}: ${data.value} ${t('dashboard.problems')}`}</Text>
        </Box>
      );
    }
    return null;
  };

  const CustomLineTooltip = ({ active, payload, label }) => {
    const bg = useColorModeValue('white', 'gray.700');
    if (active && payload && payload.length) {
      return (
        <Box bg={bg} p={3} borderRadius="lg" boxShadow="xl" fontSize="sm">
          <Text fontWeight="bold" mb={1}>{label}</Text>
          {payload.map((p, i) => (
            <Text key={i} style={{ color: p.stroke }}>{`${p.name}: ${p.value}`}</Text>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Flex h="100%" gap={6} overflow="hidden" direction={{ base: 'column', lg: 'row' }}>
      
      {/* Left Column: Greeting/Achievements, Schedule, Review */}
      <Flex direction="column" flex={{ base: 1, lg: 3 }} gap={6} overflow="hidden">
        
        {/* Row 1: Greeting & Achievements */}
        <Flex gap={4} h={{ base: 'auto', xl: '160px' }} shrink={0} direction={{ base: 'column', md: 'row' }}>
            <Box flex={1}><GreetingCard streak={streak} isFrozen={isFrozen} todayActivityCount={todayActivityCount} overdueCount={overdueCount} /></Box>
            <Box flex={1.5}><AchievementsCard achievements={achievements} /></Box>
        </Flex>

        {/* Row 2: Schedule */}
        <Box bg={cardBg} borderRadius="2xl" p={5} boxShadow="sm" border="1px solid" borderColor={cardBorderColor} flexShrink={0} h="160px" display="flex" flexDirection="column" justifyContent="center">
           <HStack spacing={3} mb={2}>
              <Flex p={1.5} bg="purple.50" color="purple.500" borderRadius="lg"><Icon as={CalendarIcon} boxSize={4} /></Flex>
              <Text fontWeight="bold" fontSize="md">{t('dashboard.schedule.title')}</Text>
           </HStack>
           <SimpleGrid columns={7} spacing={2} flex={1}>
              {upcomingSchedule.map((day, index) => (
                <DayCard key={day.iso} day={day} isToday={index === 0} />
              ))}
           </SimpleGrid>
        </Box>

        {/* Row 3: Review List (Flex 1) */}
        <Box flex={1} bg={cardBg} borderRadius="2xl" boxShadow="sm" display="flex" flexDirection="column" overflow="hidden" border="1px solid" borderColor={cardBorderColor}>
            <Box p={5} pb={3} flexShrink={0} borderBottom="1px solid" borderColor={useColorModeValue('gray.100', 'gray.700')}>
                <Flex justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Flex p={2} bg="brand.50" color="brand.500" borderRadius="lg"><CheckCircleIcon boxSize={4} /></Flex>
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">{t('dashboard.review.title')}</Text>
                      <Text fontSize="xs" color="gray.500">{t('dashboard.review.tomorrow')}</Text>
                    </Box>
                  </HStack>
                  <Badge colorScheme="accent" fontSize="md" px={3} py={1} borderRadius="full">
                    {t('dashboard.review.countBadge', { count: toReviewToday.length || '0' })}
                  </Badge>
                </Flex>
            </Box>
            <Box flex={1} overflowY="auto" p={4} css={{ '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '3px' } }}>
              <Stack spacing={3}>
                {toReviewToday.length === 0 && (
                  <Flex direction="column" align="center" justify="center" h="100%" color="gray.400">
                     <CheckCircleIcon boxSize={10} mb={2} opacity={0.5} />
                     <Text>{t('dashboard.review.empty')}</Text>
                  </Flex>
                )}
                {toReviewToday.map((problem) => {
                  const isOverdue = new Date(problem.nextReviewDate) < new Date(todayStr);
                  return (
                    <Box 
                      key={problem.id} 
                      p={4} 
                      borderRadius="xl" 
                      bg={subtleBg} 
                      borderLeft="4px solid" 
                      borderColor={isOverdue ? 'red.400' : 'brand.400'}
                      boxShadow="sm"
                      transition="all 0.2s"
                      _hover={{ transform: 'translateX(2px)', boxShadow: 'md', bg: reviewHoverBg }}
                    >
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing={1} overflow="hidden" flex={1} mr={4}>
                          <HStack>
                             <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                               {(i18n.language === 'zh' ? problem.title.zh : problem.title.en) || problem.title.en}
                             </Text>
                             {isOverdue && <Badge colorScheme="red" variant="solid" fontSize="0.6rem">OVERDUE</Badge>}
                          </HStack>
                          <HStack spacing={3} color="gray.500" fontSize="xs">
                             <Text>#{problem.id}</Text>
                             <Text>•</Text>
                             <Text>{t('dashboard.review.next', { date: problem.nextReviewDate })}</Text>
                          </HStack>
                        </VStack>
                        <HStack spacing={2}>
                          <ChakraTooltip label={t('dashboard.suggestions.openExternal')} hasArrow closeOnClick={true} openOnFocus={false}>
                             <IconButton 
                               icon={<ExternalLinkIcon />} 
                               variant="ghost" 
                               colorScheme="blue"
                               isRound
                               size="lg"
                               aria-label="Open Link"
                               _hover={{ bg: 'blue.50', color: 'blue.600' }}
                               onClick={(e) => {
                                 e.preventDefault();
                                 window.open(`https://leetcode.cn/problems/${problem.slug}/`, '_blank');
                                 e.currentTarget.blur();
                               }}
                             />
                          </ChakraTooltip>
                          <ChakraTooltip label={t('dashboard.review.tooltip')} hasArrow closeOnClick={true} openOnFocus={false}>
                             <IconButton 
                               icon={<CheckCircleIcon />} 
                               colorScheme="brand" 
                               variant="ghost" 
                               isRound
                               size="lg"
                               onClick={() => onRecordReview(problem.id)}
                               _hover={{ bg: 'brand.100', color: 'brand.600', transform: 'scale(1.1)' }}
                             />
                          </ChakraTooltip>
                          <ChakraTooltip label={t('common.viewSolutions')} hasArrow closeOnClick={true} openOnFocus={false}>
                             <IconButton 
                               icon={<Icon as={FaBookOpen} />} 
                               variant="ghost"
                               color={problem.solutions?.length > 0 ? "yellow.500" : "gray.500"}
                               isRound
                               onClick={() => onOpenSolutions(problem.id)}
                             />
                          </ChakraTooltip>
                        </HStack>
                      </Flex>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
        </Box>
      </Flex>

      {/* Right Column: Suggestions & Charts */}
      <Flex direction="column" flex={{ base: 1, lg: 2 }} gap={6} overflow="hidden">
         
         {/* Row 1: Suggestions (Limited to 3) */}
         <Box bg={cardBg} borderRadius="2xl" p={5} boxShadow="sm" border="1px solid" borderColor={cardBorderColor} flex="none" minH="300px">
             <Flex justify="space-between" align="center" mb={4}>
                <HStack spacing={3}>
                   <Flex p={1.5} bg="orange.50" color="orange.500" borderRadius="lg"><Icon as={SunIcon} boxSize={4} /></Flex>
                   <Text fontWeight="bold" fontSize="md">{t('dashboard.suggestions.title')}</Text>
                </HStack>
                <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={2}>Top 3</Badge>
             </Flex>
             <Stack spacing={3}>
                {suggestions.slice(0, 3).map((problem) => (
                  <Flex 
                    key={problem.id} 
                    p={3} 
                    borderRadius="xl" 
                    bg={subtleBg} 
                    align="center" 
                    justify="space-between"
                    _hover={{ bg: suggestionHoverBg }}
                    transition="background 0.2s"
                  >
                    <HStack spacing={3} overflow="hidden" flex={1}>
                       <DifficultyBadge difficulty={problem.difficulty} />
                       <VStack align="start" spacing={0} overflow="hidden">
                          <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>{(i18n.language === 'zh' ? problem.title.zh : problem.title.en) || problem.title.en}</Text>
                          <Text fontSize="xs" color="gray.500">#{problem.id}</Text>
                       </VStack>
                    </HStack>
                    <HStack spacing={2}>
                      <ChakraTooltip label={t('dashboard.suggestions.openExternal')} hasArrow closeOnClick={true} openOnFocus={false}>
                        <IconButton 
                          icon={<ExternalLinkIcon />} 
                          size="xs" 
                          variant="ghost" 
                          color="gray.400" 
                          _hover={{ color: 'blue.500', bg: 'blue.50' }} 
                          aria-label="Open Link" 
                          onClick={(e) => {
                            e.preventDefault();
                            window.open(`https://leetcode.cn/problems/${problem.slug}/`, '_blank');
                            e.currentTarget.blur();
                          }}
                        />
                      </ChakraTooltip>
                      <ChakraTooltip label={t('common.viewSolutions')} hasArrow closeOnClick={true} openOnFocus={false}>
                        <IconButton 
                          icon={<Icon as={FaBookOpen} />} 
                          size="xs" 
                          variant="ghost"
                          color={problem.solutions?.length > 0 ? "yellow.500" : "gray.400"}
                          onClick={() => onOpenSolutions(problem.id)} 
                          aria-label="View Solutions"
                        />
                      </ChakraTooltip>
                      <ChakraTooltip label={t('dashboard.suggestions.record')} hasArrow closeOnClick={true} openOnFocus={false}>
                        <IconButton icon={<AddIcon />} size="xs" variant="solid" colorScheme="orange" borderRadius="md" onClick={() => onRecordNew(problem.id)} aria-label="Record New" />
                      </ChakraTooltip>
                    </HStack>
                  </Flex>
                ))}
                {suggestions.length === 0 && <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>{t('dashboard.suggestions.empty')}</Text>}
             </Stack>
         </Box>

         {/* Row 2: Charts Area (Activity Line Chart) */}
         <Box flex={1} bg={cardBg} borderRadius="2xl" p={4} boxShadow="sm" border="1px solid" borderColor={cardBorderColor} minH="140px">
             <Text fontWeight="bold" fontSize="xs" color="gray.500" mb={2} textAlign="center">{t('dashboard.charts.activity')}</Text>
             <Box w="100%" h="calc(100% - 24px)">
                <ResponsiveContainer>
                  <LineChart data={activitySeries} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" fontSize={10} tick={{fontSize: 10}} />
                    <YAxis allowDecimals={false} fontSize={10} tick={{fontSize: 10}} />
                    <Tooltip content={<CustomLineTooltip />} />
                    <Line type="monotone" dataKey="learned" name={t('dashboard.charts.learned', 'Learned')} stroke={learnedColor} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="reviewed" name={t('dashboard.charts.reviewed', 'Reviewed')} stroke={reviewedColor} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
             </Box>
         </Box>
         
         {/* Row 3: Coverage Pie & Difficulty Distribution */}
         <Flex gap={4} flexShrink={0} h="140px">
             {/* Coverage Pie Chart - Compact */}
             <Box flex={1} bg={cardBg} borderRadius="2xl" p={3} boxShadow="sm" border="1px solid" borderColor={cardBorderColor}>
                 <Text fontWeight="bold" fontSize="xs" color="gray.500" mb={1} textAlign="center">{t('dashboard.charts.coverage')}</Text>
                 <Box w="100%" h="calc(100% - 20px)">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={translatedProgressPie} cx="50%" cy="50%" innerRadius={20} outerRadius={35} dataKey="value" paddingAngle={3} stroke="none">
                          {translatedProgressPie.map((entry, index) => <Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend iconSize={6} wrapperStyle={{fontSize: '10px'}} layout="vertical" verticalAlign="middle" align="right" />
                      </PieChart>
                    </ResponsiveContainer>
                 </Box>
             </Box>
             
             {/* Difficulty Distribution */}
             <Box flex={1} bg={cardBg} borderRadius="2xl" px={4} py={3} boxShadow="sm" border="1px solid" borderColor={cardBorderColor}>
                 <Flex justify="space-between" align="center" mb={3}>
                   <Text fontWeight="bold" fontSize="xs" color="gray.500">{t('dashboard.charts.difficulty', 'Difficulty')}</Text>
                   <HStack spacing={2} fontSize="9px">
                     <HStack spacing={1}>
                       <Box w="6px" h="6px" borderRadius="sm" bg="green.500" />
                       <Text color="gray.500">{t('dashboard.status.mastered', 'Mastered')}</Text>
                     </HStack>
                     <HStack spacing={1}>
                       <Box w="6px" h="6px" borderRadius="sm" bg="green.200" />
                       <Text color="gray.500">{t('dashboard.status.learning', 'Learning')}</Text>
                     </HStack>
                   </HStack>
                 </Flex>
                 <VStack spacing={1.5} align="stretch" h="calc(100% - 36px)" justify="center">
                    {difficultyStats.map((item) => (
                      <Popover key={item.name} trigger="hover" placement="top" isLazy closeOnBlur={true}>
                        <PopoverTrigger>
                          <HStack 
                            spacing={1} 
                            fontSize="xs" 
                            cursor="pointer" 
                            py={0.5}
                            px={1} 
                            mx={-1} 
                            borderRadius="md"
                            transition="all 0.2s"
                            _hover={{ bg: diffHoverBg, transform: 'scale(1.01)' }}
                            justify="center"
                          >
                            <Text w="15%" fontWeight="semibold" fontSize="10px" color={item.color} isTruncated flexShrink={0}>{t(`dashboard.difficulty.${item.name.toLowerCase()}`, item.name)}</Text>
                            <Box w="58%" h="12px" bg={diffProgressBg} borderRadius="full" overflow="hidden" position="relative">
                              {/* Mastered portion - solid color */}
                              <Box 
                                position="absolute"
                                left={0}
                                h="100%" 
                                w={`${item.masteredPercent}%`} 
                                bg={item.color} 
                                borderRadius="full"
                                transition="width 0.5s ease"
                                zIndex={2}
                              />
                              {/* Learning portion - lighter color */}
                              <Box 
                                position="absolute"
                                left={0}
                                h="100%" 
                                w={`${item.masteredPercent + item.learningPercent}%`} 
                                bg={item.lightColor} 
                                borderRadius="full"
                                transition="width 0.5s ease"
                                zIndex={1}
                              />
                            </Box>
                            <Text w="16%" textAlign="right" fontWeight="bold" fontSize="9px" flexShrink={0}>
                              <Text as="span" color={item.color}>{item.done}</Text>
                              <Text as="span" color="gray.400">/{item.total}</Text>
                            </Text>
                          </HStack>
                        </PopoverTrigger>
                        <PopoverContent w="auto" minW="150px" bg={diffPopoverBg} borderRadius="xl" boxShadow="lg" border="1px solid" borderColor={diffPopoverBorder}>
                          <PopoverArrow bg={diffPopoverBg} />
                          <PopoverBody p={3}>
                            <VStack align="start" spacing={1.5}>
                              <HStack justify="space-between" w="full">
                                <Text fontSize="sm" fontWeight="bold" color={item.color}>
                                  {t(`dashboard.difficulty.${item.name.toLowerCase()}`, item.name)}
                                </Text>
                                <Badge colorScheme={item.name === 'Easy' ? 'green' : item.name === 'Medium' ? 'orange' : 'red'} fontSize="xs">
                                  {item.percent}%
                                </Badge>
                              </HStack>
                              <Box w="full" h="1px" bg={diffPopoverBorder} />
                              <HStack justify="space-between" w="full" fontSize="xs">
                                <HStack spacing={1}>
                                  <Box w="8px" h="8px" borderRadius="full" bg={item.color} />
                                  <Text color="gray.500">{t('dashboard.status.mastered', 'Mastered')}</Text>
                                </HStack>
                                <Text fontWeight="bold">{item.mastered}</Text>
                              </HStack>
                              <HStack justify="space-between" w="full" fontSize="xs">
                                <HStack spacing={1}>
                                  <Box w="8px" h="8px" borderRadius="full" bg={item.lightColor} />
                                  <Text color="gray.500">{t('dashboard.status.learning', 'Learning')}</Text>
                                </HStack>
                                <Text fontWeight="bold">{item.learning}</Text>
                              </HStack>
                              <HStack justify="space-between" w="full" fontSize="xs">
                                <HStack spacing={1}>
                                  <Box w="8px" h="8px" borderRadius="full" bg="gray.300" />
                                  <Text color="gray.500">{t('dashboard.status.unstarted', 'Unstarted')}</Text>
                                </HStack>
                                <Text fontWeight="bold">{item.total - item.done}</Text>
                              </HStack>
                            </VStack>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    ))}
                 </VStack>
             </Box>
         </Flex>

      </Flex>
    </Flex>
  );
}

export default Dashboard;
