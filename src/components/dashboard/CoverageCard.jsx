import React from 'react';
import {
  Box,
  Text,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import SpotlightCard from '../common/SpotlightCard';

const CustomPieTooltip = ({ active, payload }) => {
  const { t } = useTranslation();
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

const CoverageCard = ({ progressPie }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.100', 'gray.700');

  const translatedProgressPie = progressPie.map(item => ({
    ...item,
    name: t(`dashboard.charts.pieLabels.${item.name.toLowerCase()}`, item.name),
  }));

  const pieColors = useColorModeValue(
    [theme.colors.brand[200], theme.colors.brand[500], theme.colors.brand[800]],
    [theme.colors.brand[700], theme.colors.brand[400], theme.colors.brand[200]]
  );

  return (
     <SpotlightCard flex={1} bg={cardBg} borderRadius="2xl" p={3} boxShadow="sm" borderColor={cardBorderColor} display="flex" flexDirection="column">
         <Text fontWeight="bold" fontSize="xs" color="gray.500" mb={1} textAlign="center" flexShrink={0}>{t('dashboard.charts.coverage')}</Text>
         <Box w="100%" flex={1} minH={0}>
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
     </SpotlightCard>
  );
};

export default CoverageCard;
