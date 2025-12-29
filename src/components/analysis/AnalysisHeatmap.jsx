import React from 'react';
import {
  Badge,
  Box,
  Heading,
  HStack,
  useColorModeValue,
  useToken,
} from '@chakra-ui/react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { subYears } from 'date-fns';
import { useTranslation } from 'react-i18next';
import 'react-calendar-heatmap/dist/styles.css';
import './analysis.css';

const AnalysisHeatmap = ({ heatmapData, setSelectedDate }) => {
  const { t } = useTranslation();
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  // Heatmap Colors (Using Tokens for CSS injection)
  const emptyCellBgToken = useColorModeValue('gray.100', 'gray.700');
  const heatMapScale1Token = useColorModeValue('brand.100', 'brand.900');
  const heatMapScale2Token = useColorModeValue('brand.300', 'brand.700');
  const heatMapScale3Token = useColorModeValue('brand.500', 'brand.500');
  const heatMapScale4Token = useColorModeValue('brand.700', 'brand.300');

  const [
    emptyCellBg,
    heatMapScale1,
    heatMapScale2,
    heatMapScale3,
    heatMapScale4,
  ] = useToken('colors', [
    emptyCellBgToken,
    heatMapScale1Token,
    heatMapScale2Token,
    heatMapScale3Token,
    heatMapScale4Token,
  ]);

  return (
    <Box
      className="calendar-container heatmap-container"
      bg={cardBg}
      borderColor={borderColor}
    >
      <HStack justify="space-between" mb={6}>
         <Heading size="md">{t('history.calendar.title')}</Heading>
         <Badge colorScheme="brand" variant="subtle">Last Year</Badge>
      </HStack>
      
      <style>{`
        .calendar-container .react-calendar-heatmap .color-empty { fill: ${emptyCellBg} !important; }
        .calendar-container .react-calendar-heatmap .color-scale-1 { fill: ${heatMapScale1}; }
        .calendar-container .react-calendar-heatmap .color-scale-2 { fill: ${heatMapScale2}; }
        .calendar-container .react-calendar-heatmap .color-scale-3 { fill: ${heatMapScale3}; }
        .calendar-container .react-calendar-heatmap .color-scale-4 { fill: ${heatMapScale4}; }
        .calendar-container .react-calendar-heatmap rect:focus { outline: none; }
      `}</style>
      
      <CalendarHeatmap
        startDate={subYears(new Date(), 1)}
        endDate={new Date()}
        values={heatmapData}
        gutterSize={4}
        classForValue={(value) => {
          if (!value || value.count === 0) return 'color-empty';
          return `color-scale-${Math.min(value.count, 4)}`;
        }}
        tooltipDataAttrs={value => ({
          'data-tooltip-id': 'heatmap-tooltip',
          'data-tooltip-content': value.date ? `${value.date} · ${value.count} activities` : 'No activity',
        })}
        onClick={value => value && setSelectedDate(value)}
      />
      <ReactTooltip id="heatmap-tooltip" />
    </Box>
  );
};

export default AnalysisHeatmap;
