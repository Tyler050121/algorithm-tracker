import React, { useMemo, useState, useCallback } from 'react';
import {
  Button,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, subYears } from 'date-fns';
import { FiActivity, FiPlayCircle } from 'react-icons/fi';
import { useProblems } from '../context/ProblemContext';
import { useHistoryStats } from '../hooks/useHistoryStats';
import ReviewHistoryModal from '../components/common/ReviewHistoryModal';
import HistoryStats from '../components/history/HistoryStats';
import HistoryHeatmap from '../components/history/HistoryHeatmap';
import HistoryTable from '../components/history/HistoryTable';
import ActivityStream from '../components/history/ActivityStream';

function HistoryBoard() {
  const { t } = useTranslation();
  const { undoHistory, updateHistoryDate } = useProblems();
  const historyData = useHistoryStats();
  const [selectedDate, setSelectedDate] = useState({ date: format(new Date(), 'yyyy-MM-dd') });
  const [newDate, setNewDate] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProblemForChart, setSelectedProblemForChart] = useState(null);

  const { allHistory, totalLearns, totalReviews, activeDays, historyByDate } = historyData || { 
    allHistory: [], totalLearns: 0, totalReviews: 0, activeDays: 0, historyByDate: new Map() 
  };

  // Infinite scroll state
  const [displayCount, setDisplayCount] = useState(15);

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 300) {
      setDisplayCount(prev => Math.min(prev + 15, allHistory.length));
    }
  }, [allHistory.length]);

  const displayedHistory = useMemo(() => allHistory.slice(0, displayCount), [allHistory, displayCount]);

  const handleChartOpen = useCallback((problem) => {
    setSelectedProblemForChart(problem);
    onOpen();
  }, [onOpen]);

  // Calculations
  const heatmapData = useMemo(() => {
    const startDate = subYears(new Date(), 1);
    const dateMap = new Map(historyByDate);
    const data = [];
    for (let i = 0; i < 366; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = format(currentDate, 'yyyy-MM-dd');
      const records = dateMap.get(dateString) || [];
      data.push({ date: dateString, count: records.length });
    }
    return data;
  }, [historyByDate]);

  const selectedDayActivities = useMemo(() =>
    selectedDate ? historyByDate.get(selectedDate.date) || [] : [],
    [selectedDate, historyByDate]
  );

  // Empty State
  if (!allHistory.length) {
    return (
      <VStack spacing={6} align="center" justify="center" h="60vh">
        <Icon as={FiActivity} boxSize={16} color="gray.300" />
        <VStack spacing={2}>
          <Heading size="lg" color="gray.600">{t('history.noRecords.title')}</Heading>
          <Text color="gray.500">{t('history.noRecords.description')}</Text>
        </VStack>
        <Button as={RouterLink} to="/" colorScheme="brand" size="lg" leftIcon={<FiPlayCircle />}>
          {t('history.noRecords.cta')}
        </Button>
      </VStack>
    );
  }

  return (
    <Flex direction="column" h="100%" overflow="hidden">
      {/* Top Stats Row */}
      <HistoryStats 
        totalLearns={totalLearns} 
        totalReviews={totalReviews} 
        activeDays={activeDays} 
      />

      {/* Main Content Split */}
      <Flex flex={1} gap={6} overflow="hidden" direction={{ base: 'column', xl: 'row' }}>
        
        {/* Left Main Column (Heatmap + Table) */}
        <VStack flex={1} spacing={6} h="full" overflow="hidden">
          
          {/* Heatmap Section */}
          <HistoryHeatmap 
            heatmapData={heatmapData} 
            setSelectedDate={setSelectedDate} 
          />

          {/* History Table Section */}
          <HistoryTable 
            displayedHistory={displayedHistory}
            handleScroll={handleScroll}
            newDate={newDate}
            setNewDate={setNewDate}
            undoHistory={undoHistory}
            updateHistoryDate={updateHistoryDate}
            handleChartOpen={handleChartOpen}
          />
        </VStack>

        {/* Right Sidebar: Selected Day Stream */}
        <ActivityStream 
          selectedDate={selectedDate}
          selectedDayActivities={selectedDayActivities}
          handleChartOpen={handleChartOpen}
          undoHistory={undoHistory}
        />

      </Flex> {/* End Main Content Split */}

      {/* Chart Modal */}
      <ReviewHistoryModal isOpen={isOpen} onClose={onClose} problem={selectedProblemForChart} />

    </Flex>
  );
}

export default HistoryBoard;
