import React from 'react';
import {
  Box,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../context/ThemeContext';
import SpotlightCard from '../common/SpotlightCard';

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

const ActivityChartCard = ({ activitySeries }) => {
  const { t } = useTranslation();
  const { colorScheme, schemes } = useAppTheme();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.100', 'gray.700');
  const learnedColor = useColorModeValue(schemes[colorScheme].colors.brand[500], schemes[colorScheme].colors.brand[300]);
  const reviewedColor = useColorModeValue(schemes[colorScheme].colors.accent[500], schemes[colorScheme].colors.accent[300]);

  return (
     <SpotlightCard flex={{ base: 'none', xl: 3 }} minH={{ base: '140px', xl: 0 }} bg={cardBg} borderRadius="2xl" p={4} boxShadow="sm" borderColor={cardBorderColor} display="flex" flexDirection="column">
         <Text fontWeight="bold" fontSize="xs" color="gray.500" mb={2} textAlign="center" flexShrink={0}>{t('dashboard.charts.activity')}</Text>
         <Box w="100%" flex={1} minH={0}>
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
     </SpotlightCard>
  );
};

export default ActivityChartCard;
