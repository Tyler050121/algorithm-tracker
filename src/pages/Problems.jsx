import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ReviewHistoryModal from '../components/common/ReviewHistoryModal';
import ProblemsHeader from '../components/problems/ProblemsHeader';
import ProblemsTable from '../components/problems/ProblemsTable';

import { useProblems } from '../context/ProblemContext';

function ProblemsBoard({ onOpenSolutions }) {
  const { problems: allProblems } = useProblems();
  const [search, setSearch] = useState('');
  const { i18n } = useTranslation();
  
  // Chart Modal State
  const { isOpen: isChartOpen, onOpen: onChartOpen, onClose: onChartClose } = useDisclosure();
  const [selectedProblemForChart, setSelectedProblemForChart] = useState(null);

  const handleChartOpen = useCallback((problem) => {
    setSelectedProblemForChart(problem);
    onChartOpen();
  }, [onChartOpen]);

  // Infinite scroll state
  const [displayCount, setDisplayCount] = useState(15);
  const scrollContainerRef = useRef(null);

  const problems = useMemo(
    () =>
      allProblems.filter((p) => {
        const title = (i18n.language === 'zh' ? p.title.zh : p.title.en) || '';
        return title.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search.trim());
      }),
    [allProblems, search, i18n.language]
  );

  // Reset display count when search changes
  useEffect(() => {
    setDisplayCount(15);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [search]);

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 300) {
      setDisplayCount(prev => Math.min(prev + 15, problems.length));
    }
  }, [problems.length]);

  const displayedProblems = useMemo(() => problems.slice(0, displayCount), [problems, displayCount]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box 
      h="100%" 
      display="flex" 
      flexDirection="column"
      bg={cardBg} 
      border="1px solid" 
      borderColor={border} 
      borderRadius="xl" 
      p={6} 
      transition="all 0.3s ease"
    >
      <ProblemsHeader search={search} setSearch={setSearch} />

      <ProblemsTable 
        ref={scrollContainerRef}
        displayedProblems={displayedProblems}
        handleScroll={handleScroll}
        onOpenSolutions={onOpenSolutions}
        handleChartOpen={handleChartOpen}
      />

      {/* Chart Modal */}
      <ReviewHistoryModal isOpen={isChartOpen} onClose={onChartClose} problem={selectedProblemForChart} />
    </Box>
  );
}

export default ProblemsBoard;
