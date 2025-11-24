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

const DifficultyBadge = ({ difficulty }) => {
  const { t } = useTranslation();
  const safeDifficulty = difficulty?.toLowerCase() || 'unknown';
  const { label, color } = DIFFICULTY_MAP[safeDifficulty] || { label: 'Unknown', color: 'gray' };
  return (
    <Badge colorScheme={color} variant="subtle" fontSize="xs">
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

const WelcomeSection = ({ streak, isFrozen, achievements, todayActivityCount, overdueCount }) => {
  const { t } = useTranslation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const nextAchievement = achievements.find(a => !a.unlocked);

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
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      {/* Left Card: Greeting & Streak */}
      <Box 
        bg={bg} 
        p={6} 
        borderRadius="2xl" 
        boxShadow="sm" 
        border="1px solid" 
        borderColor={borderColor}
        position="relative"
        overflow="hidden"
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
          
          {/* Removed Badge from here */}
        </VStack>
      </Box>

      {/* Right Card: Achievements */}
      <Box 
        bg={bg} 
        p={6} 
        borderRadius="2xl" 
        boxShadow="sm" 
        border="1px solid" 
        borderColor={borderColor}
        display="flex"
        flexDirection="column"
        justifyContent="center"
      >
        <Flex justify="space-between" align="center" mb={4}>
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
        
        <Box position="relative" w="full">
            <HStack 
              spacing={4} 
              overflowX="auto" 
              py={2} 
              px={1}
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
                    minW={12} h={12}
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
                    <Text fontSize="xl">{achievement.icon}</Text>
                  </Flex>
                </ChakraTooltip>
              ))}
            </HStack>
        </Box>
      </Box>
    </SimpleGrid>
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
  } = useDashboardStats();

  const onRecordReview = (id) => completeProblem(id, 'review');
  const onRecordNew = (id) => completeProblem(id, 'new');

  const cardBg = useColorModeValue('white', 'gray.800');
  // Removed cardBorder
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  const gridColor = useColorModeValue('gray.200', 'gray.600');

  const CustomPieTooltip = ({ active, payload }) => {
    const bg = useColorModeValue('white', 'gray.700');
    // Removed border
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
    // Removed border
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

  const translatedProgressPie = progressPie.map(item => ({
    ...item,
    name: t(`dashboard.charts.pieLabels.${item.name.toLowerCase()}`, item.name),
  }));

  const currentThemeColors = schemes[colorScheme].colors;
  
  const pieColors = useColorModeValue(
    [currentThemeColors.brand[200], currentThemeColors.brand[500], currentThemeColors.brand[800]], 
    [currentThemeColors.brand[700], currentThemeColors.brand[400], currentThemeColors.brand[200]]
  );
  const learnedColor = useColorModeValue(currentThemeColors.brand[500], currentThemeColors.brand[300]);
  const reviewedColor = useColorModeValue(currentThemeColors.accent[500], currentThemeColors.accent[300]);
  


  return (
    <Stack spacing={6}>
      {/* Welcome & Achievements */}
      <WelcomeSection streak={streak} isFrozen={isFrozen} achievements={achievements} todayActivityCount={todayActivityCount} overdueCount={overdueCount} />

      {/* Today's Review & New Suggestions (Moved Up for Priority) */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Box bg={cardBg} boxShadow="sm" borderRadius="xl" p={6} transition="all 0.3s ease" _hover={{ boxShadow: 'md' }}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontWeight="semibold">{t('dashboard.review.title')} ({todayStr})</Text>
              <Text fontSize="sm" color="gray.500">
                {t('dashboard.review.tomorrow')}
              </Text>
            </Box>
            <Badge colorScheme="accent">{t('dashboard.review.countBadge', { count: toReviewToday.length || '0' })}</Badge>
          </Flex>
          <Stack spacing={3}>
            {toReviewToday.length === 0 && (
              <Text color="gray.500" p={4}>{t('dashboard.review.empty')}</Text>
            )}
            {toReviewToday.slice(0, 5).map((problem) => (
              <Flex
                key={problem.id}
                justify="space-between"
                align="center"
                p={3}
                borderRadius="lg"
                bg={subtleBg}
                h="70px"
                border="2px solid"
                borderColor={new Date(problem.nextReviewDate) < new Date(todayStr) ? 'red.300' : 'transparent'}
                animation={new Date(problem.nextReviewDate) < new Date(todayStr) ? 'glowing-border 2s ease-in-out infinite' : 'none'}
              >
                <Box>
                  <Text fontWeight="semibold">{(i18n.language === 'zh' ? problem.title.zh : problem.title.en) || problem.title.en}</Text>
                  <Text fontSize="sm" color="gray.500">
                    #{problem.id} · {t('dashboard.review.next', { date: problem.nextReviewDate || t('dashboard.review.done') })}
                  </Text>
                </Box>
                <ChakraTooltip label={t('dashboard.review.tooltip')} hasArrow>
                  <IconButton
                    icon={<CheckCircleIcon />}
                    colorScheme="brand"
                    variant="ghost"
                    isRound
                    onClick={() => onRecordReview(problem.id)}
                  />
                </ChakraTooltip>
                <ChakraTooltip label={t('dashboard.solutions.view', 'View Solutions')} hasArrow closeOnClick={true} openDelay={500}>
                  <IconButton
                    icon={<Icon as={FaBookOpen} />}
                    size="sm"
                    variant="ghost"
                    colorScheme={problem.solutions?.length > 0 ? 'yellow' : 'gray'}
                    onClick={() => onOpenSolutions(problem.id)}
                  />
                </ChakraTooltip>
              </Flex>
            ))}
          </Stack>
        </Box>

        <Box bg={cardBg} boxShadow="sm" borderRadius="xl" p={6} transition="all 0.3s ease" _hover={{ boxShadow: 'md' }}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontWeight="semibold">{t('dashboard.suggestions.title')}</Text>
              <Text fontSize="sm" color="gray.500">
                {t('dashboard.suggestions.subtitle')}
              </Text>
            </Box>
            <Badge colorScheme="brand">{t('dashboard.suggestions.badge')}</Badge>
          </Flex>
          {suggestions.length === 0 ? (
            <Text color="gray.500" p={4}>{t('dashboard.suggestions.empty')}</Text>
          ) : (
            <Stack spacing={3}>
              {suggestions.slice(0, 5).map((problem) => (
                <Flex key={problem.id} justify="space-between" align="center" p={3} borderRadius="lg" bg={subtleBg} h="70px">
                  <VStack align="flex-start" spacing={1}>
                    <Text fontWeight="medium">{(i18n.language === 'zh' ? problem.title.zh : problem.title.en) || problem.title.en}</Text>
                    <HStack>
                      <DifficultyBadge difficulty={problem.difficulty} />
                      <Text fontSize="xs" color="gray.500">
                        #{problem.id}
                      </Text>
                    </HStack>
                  </VStack>
                  <HStack>
                    <ChakraTooltip label={t('dashboard.suggestions.openExternal')} hasArrow>
                      <Link href={`https://leetcode.cn/problems/${problem.slug}/`} isExternal>
                        <IconButton icon={<ExternalLinkIcon />} size="sm" variant="ghost" isDisabled={!problem.slug} />
                      </Link>
                    </ChakraTooltip>
                    <ChakraTooltip label={t('dashboard.solutions.view', 'View Solutions')} hasArrow closeOnClick={true} openDelay={500}>
                      <IconButton
                        icon={<Icon as={FaBookOpen} />}
                        size="sm"
                        variant="ghost"
                        colorScheme={problem.solutions?.length > 0 ? 'yellow' : 'gray'}
                        onClick={() => onOpenSolutions(problem.id)}
                      />
                    </ChakraTooltip>
                    <ChakraTooltip label={t('dashboard.suggestions.record')} hasArrow>
                      <IconButton
                        icon={<AddIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="brand"
                        onClick={() => onRecordNew(problem.id)}
                      />
                    </ChakraTooltip>
                  </HStack>
                </Flex>
              ))}
            </Stack>
          )}
        </Box>
      </SimpleGrid>

      {/* Upcoming Schedule */}
      <Box bg={cardBg} boxShadow="sm" borderRadius="xl" p={4} transition="all 0.3s ease" _hover={{ boxShadow: 'md' }}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={3}>
            <Flex p={2} bg={useColorModeValue('brand.50', 'brand.900')} borderRadius="lg" color="brand.500">
                <Icon as={CalendarIcon} boxSize={4} />
            </Flex>
            <VStack align="start" spacing={0}>
              <Text fontWeight="semibold" fontSize="md">{t('dashboard.schedule.title')}</Text>
            </VStack>
          </HStack>
        </Flex>
        
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 7 }} spacing={3}>
          {upcomingSchedule.map((day, index) => (
            <DayCard key={day.iso} day={day} isToday={index === 0} />
          ))}
        </SimpleGrid>
      </Box>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
        <Box bg={cardBg} boxShadow="sm" borderRadius="xl" p={6} transition="all 0.3s ease" _hover={{ boxShadow: 'md' }}>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold">{t('dashboard.charts.coverage')}</Text>
            <Badge colorScheme="brand">{t('dashboard.charts.coverageBadge')}</Badge>
          </Flex>
          <Box width="100%" height={{ base: 220, md: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={translatedProgressPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {translatedProgressPie.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip cursor={{ fill: 'transparent' }} content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        <Box bg={cardBg} boxShadow="sm" borderRadius="xl" p={6} transition="all 0.3s ease" _hover={{ boxShadow: 'md' }}>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold">{t('dashboard.charts.activity')}</Text>
            <Badge colorScheme="accent">{t('dashboard.charts.activityBadge')}</Badge>
          </Flex>
          <Box width="100%" height={{ base: 230, md: 260 }}>
            <ResponsiveContainer>
              <LineChart data={activitySeries} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip cursor={{ stroke: gridColor, strokeWidth: 1 }} content={<CustomLineTooltip />} />
                <Legend verticalAlign="top" height={32} />
                <Line type="monotone" dataKey="learned" name={t('dashboard.charts.newLine')} stroke={learnedColor} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="reviewed" name={t('dashboard.charts.reviewLine')} stroke={reviewedColor} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}

export default Dashboard;
