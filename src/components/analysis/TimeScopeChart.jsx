import React, { useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Select,
  Input,
  Text,
  useColorModeValue,
  useTheme,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { 
  format, 
  parseISO, 
  startOfDay, 
  endOfDay, 
  eachHourOfInterval, 
  isSameHour, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval, 
  isSameMonth,
  addDays,
  subDays,
  addMonths,
  subMonths,
  addYears,
  subYears
} from 'date-fns';
import { useTranslation } from 'react-i18next';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './analysis.css';

const TimeScopeChart = ({ allHistory, ...props }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [scope, setScope] = useState('month'); // 'day', 'month', 'year'
  const [currentDate, setCurrentDate] = useState(new Date());

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.100', 'gray.700');
  const learnedColor = useColorModeValue(theme.colors.brand[500], theme.colors.brand[300]);
  const reviewedColor = useColorModeValue(theme.colors.accent[500], theme.colors.accent[300]);

  const handlePrev = () => {
    if (scope === 'day') setCurrentDate(d => subDays(d, 1));
    if (scope === 'month') setCurrentDate(d => subMonths(d, 1));
    if (scope === 'year') setCurrentDate(d => subYears(d, 1));
  };

  const handleNext = () => {
    if (scope === 'day') setCurrentDate(d => addDays(d, 1));
    if (scope === 'month') setCurrentDate(d => addMonths(d, 1));
    if (scope === 'year') setCurrentDate(d => addYears(d, 1));
  };

  const chartData = useMemo(() => {
    let data = [];
    const history = allHistory || [];

    if (scope === 'day') {
      const start = startOfDay(currentDate);
      const end = endOfDay(currentDate);
      const hours = eachHourOfInterval({ start, end });
      
      data = hours.map(hour => {
        const hourRecords = history.filter(h => isSameHour(parseISO(h.date), hour));
        return {
          name: format(hour, 'HH:mm'),
          learned: hourRecords.filter(h => h.type === 'learn').length,
          reviewed: hourRecords.filter(h => h.type === 'review').length,
        };
      });
    } else if (scope === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const days = eachDayOfInterval({ start, end });

      data = days.map(day => {
        const dayRecords = history.filter(h => isSameDay(parseISO(h.date), day));
        return {
          name: format(day, 'd'),
          fullDate: format(day, 'yyyy-MM-dd'),
          learned: dayRecords.filter(h => h.type === 'learn').length,
          reviewed: dayRecords.filter(h => h.type === 'review').length,
        };
      });
    } else if (scope === 'year') {
      const start = startOfYear(currentDate);
      const end = endOfYear(currentDate);
      const months = eachMonthOfInterval({ start, end });

      data = months.map(month => {
        const monthRecords = history.filter(h => isSameMonth(parseISO(h.date), month));
        return {
          name: format(month, 'MMM'),
          learned: monthRecords.filter(h => h.type === 'learn').length,
          reviewed: monthRecords.filter(h => h.type === 'review').length,
        };
      });
    }

    return data;
  }, [scope, currentDate, allHistory]);

  const getDateLabel = () => {
    if (scope === 'day') return format(currentDate, 'yyyy-MM-dd');
    if (scope === 'month') return format(currentDate, 'yyyy-MM');
    if (scope === 'year') return format(currentDate, 'yyyy');
    return '';
  };

  return (
    <Box 
      className="timescope-container"
      bg={cardBg} 
      borderColor={cardBorderColor}
      {...props}
    >
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={4} flexShrink={0}>
        <HStack spacing={4}>
           <Select className="timescope-select" value={scope} onChange={(e) => setScope(e.target.value)} size="sm" borderRadius="md">
             <option value="day">{t('common.days', 'Day')}</option>
             <option value="month">{t('common.months', 'Month')}</option>
             <option value="year">{t('common.years', 'Year')}</option>
           </Select>
           <HStack spacing={2}>
             <IconButton icon={<FiChevronLeft />} size="sm" onClick={handlePrev} variant="ghost" />
             <Text className="timescope-date-label" fontWeight="bold" textAlign="center">{getDateLabel()}</Text>
             <IconButton icon={<FiChevronRight />} size="sm" onClick={handleNext} variant="ghost" />
           </HStack>
        </HStack>
        <HStack spacing={6}>
            <HStack>
                <Box w={3} h={3} borderRadius="full" bg={learnedColor} />
                <Text fontSize="sm" color="gray.500">{t('dashboard.charts.learned', 'Learned')}</Text>
            </HStack>
            <HStack>
                <Box w={3} h={3} borderRadius="full" bg={reviewedColor} />
                <Text fontSize="sm" color="gray.500">{t('dashboard.charts.reviewed', 'Reviewed')}</Text>
            </HStack>
        </HStack>
      </Flex>

      <Box flex="1" minH="0" w="100%">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={useColorModeValue('gray.200', 'gray.700')} />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: useColorModeValue('gray.500', 'gray.400'), fontSize: 12 }}
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: useColorModeValue('gray.500', 'gray.400'), fontSize: 12 }}
            />
            <Tooltip 
                contentStyle={{ 
                    backgroundColor: useColorModeValue('white', '#2D3748'),
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
            />
            <Line 
                type="monotone" 
                dataKey="learned" 
                stroke={learnedColor} 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2 }} 
                activeDot={{ r: 6 }}
            />
            <Line 
                type="monotone" 
                dataKey="reviewed" 
                stroke={reviewedColor} 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2 }} 
                activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default TimeScopeChart;
