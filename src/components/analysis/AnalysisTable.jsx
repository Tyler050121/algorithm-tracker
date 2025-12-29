import React, { useRef } from 'react';
import {
  Box,
  Heading,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import AnalysisRow from './AnalysisRow';
import './analysis.css';

const AnalysisTable = ({ 
  displayedHistory, 
  handleScroll, 
  newDate, 
  setNewDate, 
  undoHistory, 
  updateHistoryDate, 
  handleChartOpen 
}) => {
  const { t } = useTranslation();
  const scrollContainerRef = useRef(null);

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const scrollbarThumbBg = useColorModeValue('gray.200', 'gray.600');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const headerBg = useColorModeValue('white', 'gray.800');

  return (
    <Box 
      className="analysis-table-container"
      bg={cardBg} 
      borderColor={borderColor}
    >
      <Heading size="md" mb={4} flexShrink={0}>{t('history.table.title')}</Heading>
      
      {/* Scrollable Table Container */}
      <Box 
        className="analysis-scroll-container"
        onScroll={handleScroll}
        ref={scrollContainerRef}
        css={{
          '&::-webkit-scrollbar-thumb': { background: scrollbarThumbBg },
          overscrollBehavior: 'contain',
        }}
      >
        <Table variant="unstyled" size="sm" sx={{ tableLayout: 'fixed' }}>
          <Thead position="sticky" top={0} bg={headerBg} zIndex={10} shadow="sm">
            <Tr>
              <Th className="analysis-date-col" whiteSpace="nowrap" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('history.table.date')}</Th>
              <Th whiteSpace="nowrap" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('history.table.problem')}</Th>
              <Th className="analysis-difficulty-col" whiteSpace="nowrap" textAlign="center" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.difficulty')}</Th>
              <Th className="analysis-type-col" whiteSpace="nowrap" textAlign="center" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('history.table.type')}</Th>
              <Th className="analysis-chart-col" whiteSpace="nowrap" textAlign="center" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('history.table.viewChart')}</Th>
              <Th className="analysis-actions-col" whiteSpace="nowrap" textAlign="center" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('common.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {displayedHistory.map((item) => (
              <AnalysisRow
                key={item.id}
                item={item}
                newDate={newDate}
                setNewDate={setNewDate}
                onUndo={undoHistory}
                onUpdateDate={updateHistoryDate}
                handleChartOpen={handleChartOpen}
              />
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default AnalysisTable;
