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
import HistoryRow from './HistoryRow';

const HistoryTable = ({ 
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
      w="full"
      bg={cardBg} 
      boxShadow="sm" 
      borderRadius="2xl" 
      p={6}
      border="1px solid"
      borderColor={borderColor}
      flex={1}
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <Heading size="md" mb={4} flexShrink={0}>{t('history.table.title')}</Heading>
      
      {/* Scrollable Table Container */}
      <Box 
        overflowY="auto" 
        overflowX="auto"
        flex={1} 
        onScroll={handleScroll}
        ref={scrollContainerRef}
        css={{
          '&::-webkit-scrollbar': { width: '4px', height: '4px' },
          '&::-webkit-scrollbar-track': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { background: scrollbarThumbBg, borderRadius: '24px' },
          overscrollBehavior: 'contain',
        }}
      >
        <Table variant="unstyled" size="sm">
          <Thead position="sticky" top={0} bg={headerBg} zIndex={10} shadow="sm">
            <Tr>
              <Th whiteSpace="nowrap" width="120px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('history.table.date')}</Th>
              <Th whiteSpace="nowrap" width="80px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">ID</Th>
              <Th whiteSpace="nowrap" width="250px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('history.table.problem')}</Th>
              <Th whiteSpace="nowrap" display={{ base: 'none', md: 'table-cell' }} textAlign="center" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('history.table.plan')}</Th>
              <Th whiteSpace="nowrap" textAlign="center" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.difficulty')}</Th>
              <Th whiteSpace="nowrap" textAlign="center" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('history.table.type')}</Th>
              <Th whiteSpace="nowrap" textAlign="center" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('common.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {displayedHistory.map((item, index) => (
              <HistoryRow
                key={item.id}
                index={index}
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

export default HistoryTable;
