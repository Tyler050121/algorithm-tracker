import {
  Badge,
  Box,
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

const DIFFICULTY_MAP = {
  easy: { label: 'Easy', color: 'green' },
  medium: { label: 'Medium', color: 'orange' },
  hard: { label: 'Hard', color: 'red' },
};

const DifficultyBadge = ({ difficulty }) => {
  const { t } = useTranslation();
  const { label, color } = DIFFICULTY_MAP[difficulty] || { label: 'Unknown', color: 'gray' };
  return (
    <Badge colorScheme={color} variant="subtle" fontSize="xs">
      {t(`dashboard.difficulty.${difficulty}`, label)}
    </Badge>
  );
};

function Dashboard({
  todayStr,
  stats,
  progressPie,
  toReviewToday,
  toReviewTomorrow,
  suggestions,
  upcomingSchedule,
  activitySeries,
  onRecordReview,
  onRecordNew,
}) {
  const { t } = useTranslation();
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.100', 'gray.700');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  const gridColor = useColorModeValue('gray.200', 'gray.600');

  const CustomPieTooltip = ({ active, payload }) => {
    const bg = useColorModeValue('white', 'gray.700');
    const border = useColorModeValue('gray.200', 'gray.600');
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box bg={bg} p={3} borderRadius="lg" boxShadow="lg" border="1px solid" borderColor={border} fontSize="sm">
          <Text>{`${data.name}: ${data.value} ${t('dashboard.problems')}`}</Text>
        </Box>
      );
    }
    return null;
  };

  const CustomLineTooltip = ({ active, payload, label }) => {
    const bg = useColorModeValue('white', 'gray.700');
    const border = useColorModeValue('gray.200', 'gray.600');
    if (active && payload && payload.length) {
      return (
        <Box bg={bg} p={3} borderRadius="lg" boxShadow="lg" border="1px solid" borderColor={border} fontSize="sm">
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

  const pieColors = useColorModeValue(
    ['#CBD5F5', '#4FD1C5', '#2F855A'],
    ['#4A5568', '#4FD1C5', '#68D391']
  );
  const learnedColor = useColorModeValue('#319795', '#81E6D9');
  const reviewedColor = useColorModeValue('#9F7AEA', '#B794F4');

  return (
    <Stack spacing={6}>
      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <StatCard
          icon={TimeIcon}
          label={t('dashboard.stats.reviewToday')}
          value={toReviewToday.length}
          help={t('dashboard.stats.reviewTodayHelp')}
        />
        <StatCard
          icon={CalendarIcon}
          label={t('dashboard.stats.planTomorrow')}
          value={toReviewTomorrow.length}
          help={t('dashboard.stats.planTomorrowHelp')}
        />
        <StatCard
          icon={StarIcon}
          label={t('dashboard.stats.mastered')}
          value={stats.masteredCount}
          help={t('dashboard.stats.masteredHelp')}
        />
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="xl" p={6}>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold">{t('dashboard.charts.coverage')}</Text>
            <Badge colorScheme="teal">{t('dashboard.charts.coverageBadge')}</Badge>
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

        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="xl" p={6}>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold">{t('dashboard.charts.activity')}</Text>
            <Badge colorScheme="purple">{t('dashboard.charts.activityBadge')}</Badge>
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
        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="xl" p={6}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontWeight="semibold">{t('dashboard.review.title')} ({todayStr})</Text>
              <Text fontSize="sm" color="gray.500">
                {t('dashboard.review.tomorrow', { count: toReviewTomorrow.length })}
              </Text>
            </Box>
            <Badge colorScheme="orange">{t('dashboard.review.countBadge', { count: toReviewToday.length || '0' })}</Badge>
          </Flex>
          <Stack spacing={3}>
            {toReviewToday.length === 0 && (
              <Text color="gray.500" p={4}>{t('dashboard.review.empty')}</Text>
            )}
            {toReviewToday.map((problem) => (
              <Flex key={problem.id} justify="space-between" align="center" p={3} borderRadius="lg" bg={subtleBg}>
                <Box>
                  <Text fontWeight="semibold">{problem.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    #{problem.id} · {t('dashboard.review.next', { date: problem.nextReviewDate || t('dashboard.review.done') })}
                  </Text>
                </Box>
                <ChakraTooltip label={t('dashboard.review.tooltip')} hasArrow>
                  <IconButton
                    icon={<CheckCircleIcon />}
                    colorScheme="teal"
                    variant="ghost"
                    isRound
                    onClick={() => onRecordReview(problem.id)}
                  />
                </ChakraTooltip>
              </Flex>
            ))}
          </Stack>
        </Box>

        <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="xl" p={6}>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold">{t('dashboard.suggestions.title')}</Text>
            <Badge colorScheme="teal">{t('dashboard.suggestions.badge')}</Badge>
          </Flex>
          {suggestions.length === 0 ? (
            <Text color="gray.500" p={4}>{t('dashboard.suggestions.empty')}</Text>
          ) : (
            <Stack spacing={3}>
              {suggestions.map((problem) => (
                <Flex key={problem.id} justify="space-between" align="center" p={3} borderRadius="lg" bg={subtleBg}>
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
                      <Link href={problem.link} isExternal>
                        <IconButton icon={<ExternalLinkIcon />} size="sm" variant="ghost" />
                      </Link>
                    </ChakraTooltip>
                    <ChakraTooltip label={t('dashboard.suggestions.record')} hasArrow>
                      <IconButton
                        icon={<AddIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="teal"
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
      <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="xl" p={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontWeight="semibold">{t('dashboard.schedule.title')}</Text>
          <Text fontSize="sm" color="gray.500">
            {t('dashboard.schedule.subtitle')}
          </Text>
        </Flex>
        <HStack spacing={3} overflowX="auto" py={1}>
          {upcomingSchedule.map((day) => {
            const colorScheme = day.count > 4 ? 'red' : day.count > 2 ? 'orange' : day.count > 0 ? 'teal' : 'gray';
            const tooltipLabel = day.count
              ? t('dashboard.schedule.tooltip', { date: `${day.label} (${day.weekday})`, count: day.count })
              : t('dashboard.schedule.tooltipEmpty', { date: `${day.label} (${day.weekday})` });
            return (
              <ChakraTooltip key={day.iso} label={tooltipLabel} hasArrow placement="top" borderRadius="md">
                <Tag
                  size="lg"
                  colorScheme={colorScheme}
                  variant={day.count ? 'subtle' : 'outline'}
                  px={4}
                  py={3}
                  borderRadius="full"
                  minW="120px"
                  justifyContent="center"
                  textAlign="center"
                  boxShadow="sm"
                >
                  <Box>
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest">
                      {day.weekday}
                    </Text>
                    <Text fontWeight="bold" fontSize="lg">
                      {day.label}
                    </Text>
                    <Text fontSize="sm">{t('dashboard.schedule.problems', { count: day.count })}</Text>
                  </Box>
                </Tag>
              </ChakraTooltip>
            );
          })}
        </HStack>
      </Box>
    </Stack>
  );
}

function StatCard({ icon, label, value, help }) {
  const bg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const iconBg = useColorModeValue('teal.50', 'teal.800');
  const iconColor = useColorModeValue('teal.500', 'teal.200');
  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="xl"
      p={5}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={4}
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
