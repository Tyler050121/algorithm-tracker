import React from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  VStack,
  HStack,
  Progress,
  SimpleGrid,
  Divider,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FaFire, FaExclamationTriangle, FaBookOpen, FaLayerGroup, FaChartLine, FaCheckCircle, FaCalendarDay, FaBolt } from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, ResponsiveContainer, YAxis, CartesianGrid, Legend, Cell
} from 'recharts';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4, 
      staggerChildren: 0.05 
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const StatCard = ({ icon, colorScheme, value, label }) => {
    // Lighter, transparent-ish feel
    // Use theme colors with alpha/lightness
    const bgGradient = useColorModeValue(
        `linear(to-br, ${colorScheme}.50, ${colorScheme}.100)`, 
        `linear(to-br, ${colorScheme}.900, ${colorScheme}.800)`
    );
    const iconColor = useColorModeValue(`${colorScheme}.500`, `${colorScheme}.200`);
    const textColor = useColorModeValue(`${colorScheme}.700`, `${colorScheme}.100`);
    const labelColor = useColorModeValue(`${colorScheme}.600`, `${colorScheme}.300`);
    const borderColor = useColorModeValue(`${colorScheme}.200`, `${colorScheme}.700`);

    return (
        <MotionBox 
           variants={itemVariants}
           bgGradient={bgGradient}
           p={4} 
           borderRadius="2xl" 
           border="1px solid"
           borderColor={borderColor}
           position="relative"
           overflow="hidden"
           whileHover={{ y: -2, boxShadow: "md" }}
        >
           {/* Decorate Circle - very subtle */}
           <Box 
             position="absolute" 
             top="-10px" 
             right="-10px" 
             w="60px" 
             h="60px" 
             bg={`${colorScheme}.200`} 
             opacity={0.2}
             borderRadius="full" 
           />
           
           <VStack align="start" spacing={1} position="relative" zIndex={1}>
              <HStack spacing={2} mb={1}>
                 <Icon as={icon} boxSize={4} color={iconColor} />
                 <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color={labelColor}>
                    {label}
                 </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="900" lineHeight="1" color={textColor}>{value}</Text>
           </VStack>
        </MotionBox>
    );
};

const ActivityChart = ({ data }) => {
  const { t } = useTranslation();
  const learnToken = useColorModeValue('brand-500', 'brand-300');
  const reviewToken = useColorModeValue('accent-500', 'accent-300');

  // Last 14 days
  const chartData = data.slice(-14);

  return (
    <Box w="full" h="140px" mt={2}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barCategoryGap="20%">
           <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
           <XAxis 
             dataKey="date" 
             axisLine={false} 
             tickLine={false} 
             tick={{ fontSize: 10, fill: 'gray' }} 
             dy={10}
           />
           <YAxis 
             axisLine={false} 
             tickLine={false} 
             tick={{ fontSize: 10, fill: 'gray' }} 
           />
           <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
           <Bar dataKey="learned" name={t('dashboard.charts.learned', 'Learned')} stackId="a" fill={`var(--chakra-colors-${learnToken})`}>
             {chartData.map((entry, index) => {
                const radius = entry.reviewed === 0 ? [4, 4, 4, 4] : [0, 0, 4, 4];
                return <Cell key={`cell-learned-${index}`} radius={radius} />;
             })}
           </Bar>
           <Bar dataKey="reviewed" name={t('dashboard.charts.reviewed', 'Reviewed')} stackId="a" fill={`var(--chakra-colors-${reviewToken})`}>
             {chartData.map((entry, index) => {
                const radius = entry.learned === 0 ? [4, 4, 4, 4] : [4, 4, 0, 0];
                return <Cell key={`cell-reviewed-${index}`} radius={radius} />;
             })}
           </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

const WeeklyConsistency = ({ activitySeries }) => {
    const { t } = useTranslation();
    
    // Get last 7 days
    const last7 = activitySeries.slice(-7);
    while (last7.length < 7) {
        last7.unshift({ date: '', learned: 0, reviewed: 0 });
    }

    return (
        <Box mb={2}>
            <Flex justify="space-between" align="center" mb={3}>
                <HStack>
                    <Icon as={FaChartLine} color="gray.400" />
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                        {t('dashboard.charts.activity', 'Activity Trend')}
                    </Text>
                </HStack>
                <Text fontSize="xs" fontWeight="bold" color="brand.500">
                    {last7.filter(d => (d.learned + d.reviewed) > 0).length}/7 {t('common.days', 'Days')}
                </Text>
            </Flex>
            <HStack spacing={2} justify="space-between">
                {last7.map((day, idx) => {
                    const active = (day.learned + day.reviewed) > 0;
                    // Uniform height dashes
                    const label = day.date ? day.date.split('-')[1] : '';

                    return (
                        <VStack key={idx} spacing={1} flex={1}>
                            <MotionBox 
                                w="100%" 
                                h="6px"
                                borderRadius="full" 
                                bg={active ? "brand.400" : "gray.100"} 
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                            />
                            <Text fontSize="9px" color="gray.400" fontWeight="medium">
                                {label}
                            </Text>
                        </VStack>
                    )
                })}
            </HStack>
        </Box>
    )
}

const DifficultyRow = ({ label, done, total, percent, colorScheme }) => {
    const progressBg = useColorModeValue('gray.100', 'gray.600');
    
    return (
        <VStack align="stretch" spacing={1}>
            <Flex justify="space-between">
                <Text fontSize="xs" fontWeight="bold" color={`${colorScheme}.500`}>{label}</Text>
                <Text fontSize="xs" fontWeight="bold" color="gray.500">{done}/{total}</Text>
            </Flex>
            <Progress 
                value={percent} 
                size="sm" 
                colorScheme={colorScheme}
                borderRadius="full" 
                bg={progressBg}
            />
        </VStack>
    )
}

const OverviewPanel = ({ 
    streak, 
    isFrozen, 
    overdueCount, 
    difficultyStats, 
    activitySeries,
}) => {
  const { t } = useTranslation();
  
  // Colors
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  
  // Stats
  const todayLearned = activitySeries[activitySeries.length - 1]?.learned || 0;
  const todayReviewed = activitySeries[activitySeries.length - 1]?.reviewed || 0;
  const totalSolved = difficultyStats.reduce((acc, curr) => acc + curr.done, 0);
  const totalProblems = difficultyStats.reduce((acc, curr) => acc + curr.total, 0);
  
  // Extra metrics for chart area
  const last14 = activitySeries.slice(-14);
  const activeDays = last14.filter(d => (d.learned + d.reviewed) > 0).length;
  const totalActivity = last14.reduce((acc, curr) => acc + curr.learned + curr.reviewed, 0);
  const avgActivity = activeDays > 0 ? Math.round(totalActivity / activeDays) : 0;

  return (
    <MotionBox
      bg={bg}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      p={6}
      h="full"
      display="flex"
      flexDirection="column"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
        <VStack spacing={8} align="stretch" flex={1} pb={4}>
            
            {/* 1. Main Stats Row (Lighter/Theme-based Cards) */}
            <SimpleGrid columns={3} spacing={4}>
                 <StatCard 
                    icon={FaFire} 
                    colorScheme={isFrozen ? "cyan" : "brand"} 
                    value={streak} 
                    label={t('dashboard.stats.streak', 'Streak')}
                 />
                 <StatCard 
                    icon={FaBookOpen} 
                    colorScheme="accent"
                    value={todayLearned + todayReviewed} 
                    label={t('dashboard.welcome.activities', 'Activities')}
                 />
                 <StatCard 
                    icon={overdueCount > 0 ? FaExclamationTriangle : FaCheckCircle} 
                    colorScheme={overdueCount > 0 ? "danger" : "green"} 
                    value={overdueCount} 
                    label={t('dashboard.stats.overdue', 'Overdue')}
                 />
            </SimpleGrid>

            <Divider />

            {/* 2. Weekly Consistency & Activity Trend */}
            <Box>
                 <WeeklyConsistency activitySeries={activitySeries} />
                 
                 {/* Chart Summary Metrics */}
                 <HStack spacing={6} mb={2} mt={3} px={1}>
                    <HStack>
                        <Icon as={FaCalendarDay} color="gray.400" boxSize={3} />
                        <Text fontSize="xs" color="gray.500"><Text as="span" fontWeight="bold" color="gray.700">{activeDays}</Text> Active Days</Text>
                    </HStack>
                    <HStack>
                        <Icon as={FaBolt} color="gray.400" boxSize={3} />
                        <Text fontSize="xs" color="gray.500"><Text as="span" fontWeight="bold" color="gray.700">{avgActivity}</Text> Avg / Day</Text>
                    </HStack>
                 </HStack>

                 <ActivityChart data={activitySeries} />
            </Box>

            <Divider />

            {/* 3. Detailed Difficulty Progress */}
            <Box mt="auto">
                <Flex justify="space-between" align="center" mb={4}>
                    <HStack>
                        <Icon as={FaLayerGroup} color="gray.400" />
                        <Text fontSize="sm" fontWeight="bold" color="gray.600" textTransform="uppercase" letterSpacing="wide">
                            {t('dashboard.charts.difficulty', 'Mastery Progress')}
                        </Text>
                    </HStack>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400">
                        {Math.round((totalSolved / (totalProblems || 1)) * 100)}% Total
                    </Text>
                </Flex>
                
                <VStack spacing={5} align="stretch">
                    {difficultyStats.map((stat) => {
                        let scheme = 'brand';
                        if (stat.name === 'Medium') scheme = 'accent';
                        if (stat.name === 'Hard') scheme = 'danger';
                        
                        return (
                            <DifficultyRow 
                                key={stat.name}
                                label={t(`dashboard.difficulty.${stat.name.toLowerCase()}`, stat.name)}
                                done={stat.done}
                                total={stat.total}
                                percent={stat.percent}
                                colorScheme={scheme}
                            />
                        );
                    })}
                </VStack>
            </Box>

        </VStack>
    </MotionBox>
  );
};

export default OverviewPanel;
