import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  Link,
  SimpleGrid,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tag,
  Text,
  Tooltip as ChakraTooltip,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  CalendarIcon,
  StarIcon,
  TimeIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  AddIcon,
} from '@chakra-ui/icons';
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
  if (!problems || problems.length === 0) {
    return null;
  }
  return (
    <VStack align="stretch" spacing={2} p={1}>
      {problems.slice(0, 5).map((p) => (
        <HStack key={p.id} justify="space-between">
          <Text fontSize="xs">
            #{p.id} {p.name}
          </Text>
          <DifficultyBadge difficulty={p.difficulty} />
        </HStack>
      ))}
      {problems.length > 5 && <Text fontSize="xs">...and {problems.length - 5} more.</Text>}
    </VStack>
  );
};

// ...existing code...

import { useAppTheme } from '../context/ThemeContext';

function Dashboard() {
  const { t } = useTranslation();
  const { completeProblem } = useProblems();
  const { colorScheme, schemes } = useAppTheme();
  const {
    todayStr,
    stats,
    progressPie,
    toReviewToday,
    toReviewTomorrow,
    suggestions,
    upcomingSchedule,
    activitySeries,
    masteredProblems,
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
      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <ChakraTooltip
          label={<TooltipContent problems={toReviewToday} />}
          hasArrow
          placement="bottom"
          bg={useColorModeValue('white', 'gray.700')}
          color={useColorModeValue('gray.800', 'white')}
          borderRadius="md"
          isDisabled={toReviewToday.length === 0}
        >
          <Box>
            <StatCard
              icon={TimeIcon}
              label={t('dashboard.stats.reviewToday')}
              value={toReviewToday.length}
              help={t('dashboard.stats.reviewTodayHelp')}
            />
          </Box>
        </ChakraTooltip>
        <ChakraTooltip
          label={<TooltipContent problems={toReviewTomorrow} />}
          hasArrow
          placement="bottom"
          bg={useColorModeValue('white', 'gray.700')}
          color={useColorModeValue('gray.800', 'white')}
          borderRadius="md"
          isDisabled={toReviewTomorrow.length === 0}
        >
          <Box>
            <StatCard
              icon={CalendarIcon}
              label={t('dashboard.stats.planTomorrow')}
              value={toReviewTomorrow.length}
              help={t('dashboard.stats.planTomorrowHelp')}
            />
          </Box>
        </ChakraTooltip>
        <ChakraTooltip
          label={<TooltipContent problems={masteredProblems} />}
          hasArrow
          placement="bottom"
          bg={useColorModeValue('white', 'gray.700')}
          color={useColorModeValue('gray.800', 'white')}
          borderRadius="md"
          isDisabled={masteredProblems.length === 0}
        >
          <Box>
            <StatCard
              icon={StarIcon}
              label={t('dashboard.stats.mastered')}
              value={stats.masteredCount}
              help={t('dashboard.stats.masteredHelp')}
            />
          </Box>
        </ChakraTooltip>
      </SimpleGrid>

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

      {/* Today's Review & New Suggestions */}
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
                minH="70px"
                border="2px solid"
                borderColor={new Date(problem.nextReviewDate) < new Date(todayStr) ? 'red.300' : 'transparent'}
                animation={new Date(problem.nextReviewDate) < new Date(todayStr) ? 'glowing-border 2s ease-in-out infinite' : 'none'}
              >
                <Box>
                  <Text fontWeight="semibold">{problem.name}</Text>
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
                <Flex key={problem.id} justify="space-between" align="center" p={3} borderRadius="lg" bg={subtleBg} minH="70px">
                  <VStack align="flex-start" spacing={1}>
                    <Text fontWeight="medium">{problem.name}</Text>
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
    </Stack>
  );
}

function StatCard({ icon, label, value, help }) {
  const bg = useColorModeValue('white', 'gray.800');
  // Removed border
  const iconBg = useColorModeValue('brand.50', 'brand.800');
  const iconColor = useColorModeValue('brand.500', 'brand.200');
  return (
    <Box
      bg={bg}
      boxShadow="sm"
      borderRadius="xl"
      p={5}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={4}
      transition="all 0.3s ease"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
    >
      <Stat>
        <StatLabel color="gray.500">{label}</StatLabel>
        <StatNumber fontSize="2xl">{value}</StatNumber>
        <StatHelpText>{help}</StatHelpText>
      </Stat>
      <Flex
        boxSize={12}
        borderRadius="full"
        bg={iconBg}
        align="center"
        justify="center"
        color={iconColor}
      >
        <Icon as={icon} />
      </Flex>
    </Box>
  );
}

export default Dashboard;
