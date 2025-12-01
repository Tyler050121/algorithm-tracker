import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Flex,
  Tag,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  HStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Button,
  ButtonGroup,
  Input,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToken,
  Circle,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import { subYears, format, parseISO } from 'date-fns';
import { 
  FiActivity, FiRepeat, FiCalendar, FiRewind, FiEdit, FiBarChart2, 
  FiPlayCircle
} from 'react-icons/fi';
import ReviewHistoryChart from '../components/ReviewHistoryChart';
import { useProblems } from '../context/ProblemContext';
import { useHistoryStats } from '../hooks/useHistoryStats';

const DIFFICULTY_MAP = {
  easy: 'green',
  medium: 'orange',
  hard: 'red',
};

// --- Sub-components ---

// 1. Modern Stat Card
function StatCard({ icon, label, value, helpText }) {
  const bg = useColorModeValue('white', 'gray.800');
  const iconColor = useColorModeValue('brand.500', 'brand.300');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box 
      bg={bg} 
      p={5} 
      borderRadius="2xl" 
      boxShadow="sm" 
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
      border="1px solid"
      borderColor={borderColor}
    >
      <HStack spacing={4} align="start">
        <Flex 
          w={12} h={12} 
          align="center" justify="center" 
          borderRadius="xl" 
          bg={useColorModeValue('brand.50', 'whiteAlpha.100')}
          color={iconColor}
        >
          <Icon as={icon} boxSize={6} />
        </Flex>
        <VStack align="start" spacing={0}>
          <Text color={labelColor} fontSize="sm" fontWeight="medium">{label}</Text>
          <Text fontSize="2xl" fontWeight="bold" lineHeight="1.2">{value}</Text>
          {helpText && <Text fontSize="xs" color="gray.400">{helpText}</Text>}
        </VStack>
      </HStack>
    </Box>
  );
}

// 2. Timeline Item
const TimelineItem = ({ item, isLast, onChartOpen, onUndo }) => {
  const { t, i18n } = useTranslation();
  const timeColor = useColorModeValue('gray.400', 'gray.500');
  const lineColor = useColorModeValue('gray.200', 'gray.700');
  const titleColor = useColorModeValue('gray.800', 'gray.100');
  const cardBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  
  const diffColor = DIFFICULTY_MAP[item.problem.difficulty?.toLowerCase()] || 'gray';
  const isLearn = item.type === 'learn';
  const dotColor = isLearn ? 'brand.400' : 'accent.400';

  return (
    <Flex gap={3} position="relative" pb={isLast ? 0 : 6}>
      {/* Time Column */}
      <Flex direction="column" align="flex-end" minW="45px" pt={0.5}>
        <Text fontSize="xs" fontWeight="bold" color={timeColor} fontFamily="monospace">
          {format(parseISO(item.date), 'HH:mm')}
        </Text>
      </Flex>

      {/* Line & Dot */}
      <Flex direction="column" align="center" position="relative">
        <Circle size="8px" bg={dotColor} zIndex={1} mt={1.5} ring={4} ringColor={useColorModeValue('white', 'gray.800')} />
        {!isLast && (
          <Box 
            w="1px" 
            flex={1} 
            bg={lineColor} 
            position="absolute" 
            top="10px" 
            bottom="-10px" 
          />
        )}
      </Flex>

      {/* Content */}
      <Box flex={1} pb={1}>
        <Flex justify="space-between" align="start" bg={cardBg} p={3} borderRadius="lg" ml={1}>
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="bold" fontSize="sm" color={titleColor} noOfLines={2} lineHeight="short">
               {(i18n.language === 'zh' ? item.problem.title.zh : item.problem.title.en) || item.problem.title.en}
            </Text>
            
            <HStack spacing={2} wrap="wrap">
              <Badge colorScheme={isLearn ? 'brand' : 'accent'} variant="subtle" fontSize="10px" px={1.5}>
                {t(`history.actionType.${item.type}`)}
              </Badge>
              <Text fontSize="xs" color={`${diffColor}.500`} fontWeight="bold" textTransform="uppercase">
                {item.problem.difficulty}
              </Text>
              {item.plan && (
                <HStack spacing={1} color="gray.500">
                   <Text fontSize="xs" noOfLines={1}>• {t(`study_plans.${item.plan}.name`, item.plan)}</Text>
                </HStack>
              )}
            </HStack>
          </VStack>

          <HStack spacing={0} mt={-1}>
            <Tooltip label={t('history.table.viewChart')}>
               <IconButton aria-label="View Chart" icon={<FiBarChart2 />} size="xs" variant="ghost" colorScheme="gray" onClick={() => onChartOpen(item.problem)} />
            </Tooltip>
            <Tooltip label={t('common.undo')}>
               <IconButton aria-label="Undo" icon={<FiRewind />} size="xs" variant="ghost" colorScheme="red" opacity={0.5} _hover={{ opacity: 1 }} onClick={() => onUndo(item)} />
            </Tooltip>
          </HStack>
        </Flex>
      </Box>
    </Flex>
  );
};

// 3. History Row (Memoized)
const HistoryRow = React.memo(({ item, newDate, setNewDate, onUndo, onUpdateDate, handleChartOpen }) => {
  const { t, i18n } = useTranslation();
  const dateObj = parseISO(item.date);
  const dateStr = format(dateObj, 'yyyy-MM-dd');
  const timeStr = format(dateObj, 'HH:mm');
  const dateColor = useColorModeValue('gray.700', 'gray.200');
  const titleColor = useColorModeValue('gray.700', 'gray.200');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  return (
    <Tr _hover={{ bg: hoverBg }}>
      <Td py={3}>
        <VStack spacing={0} align="start">
          <Text fontSize="sm" fontWeight="bold" color={dateColor}>{dateStr}</Text>
          <Text fontSize="xs" color="gray.500">{timeStr}</Text>
        </VStack>
      </Td>
      <Td fontSize="xs" color="gray.500" py={3}>#{item.problem.id}</Td>
      <Td py={3}>
        <Text fontWeight="medium" noOfLines={1} maxW="250px" color={titleColor} title={(i18n.language === 'zh' ? item.problem.title.zh : item.problem.title.en) || item.problem.title.en}>
          {(i18n.language === 'zh' ? item.problem.title.zh : item.problem.title.en) || item.problem.title.en}
        </Text>
      </Td>
      <Td display={{ base: 'none', md: 'table-cell' }} textAlign="center" py={3}>
        {item.plan ? (
          <Tag size="sm" variant="subtle" colorScheme="gray" borderRadius="full">
            {t(`study_plans.${item.plan}.name`, item.plan)}
          </Tag>
        ) : (
          <Text color="gray.400">-</Text>
        )}
      </Td>
      <Td textAlign="center" py={3}>
        <Badge
          colorScheme={DIFFICULTY_MAP[item.problem.difficulty?.toLowerCase()] || 'gray'}
          variant="subtle"
          fontSize="xs"
          px={2}
          py={0.5}
          borderRadius="md"
        >
          {item.problem.difficulty}
        </Badge>
      </Td>
      <Td textAlign="center" py={3}>
        <Tag 
          size="sm" 
          colorScheme={item.type === 'learn' ? 'green' : 'blue'} 
          variant="subtle" 
          borderRadius="full" 
          fontWeight="bold"
        >
          {t(`history.actionType.${item.type}`)}
        </Tag>
      </Td>
      <Td textAlign="center" py={3}>
        <HStack spacing={2} justify="center">
          <Tooltip label={t('history.table.viewChart')}>
            <IconButton aria-label="Chart" icon={<FiBarChart2 />} size="sm" variant="ghost" onClick={() => handleChartOpen(item.problem)} />
          </Tooltip>
          <Popover
            placement="left"
            onOpen={() => setNewDate(format(parseISO(item.date), "yyyy-MM-dd'T'HH:mm"))}
          >
            {({ onClose }) => (
              <>
                <PopoverTrigger>
                  <IconButton aria-label="Edit Date" icon={<FiEdit />} size="sm" variant="ghost" />
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader>{t('common.editDate')}</PopoverHeader>
                  <PopoverBody>
                    <VStack>
                      <Input
                        type="datetime-local"
                        size="sm"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                      <ButtonGroup size="sm" alignSelf="flex-end">
                        <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                        <Button
                          colorScheme="brand"
                          onClick={() => {
                            onUpdateDate(item, newDate);
                            onClose();
                          }}
                        >
                          {t('common.save')}
                        </Button>
                      </ButtonGroup>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </>
            )}
          </Popover>
          <Tooltip label={t('common.undo')}>
            <IconButton aria-label="Undo" icon={<FiRewind />} size="sm" variant="ghost" colorScheme="red" onClick={() => onUndo(item)} />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  );
});
HistoryRow.displayName = 'HistoryRow';


// --- Main Component ---

function HistoryBoard() {
  const { t, i18n } = useTranslation();
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
  const scrollContainerRef = useRef(null);

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

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const scrollbarThumbBg = useColorModeValue('gray.200', 'gray.600');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const emptyStateBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const headerBg = useColorModeValue('white', 'gray.800');

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
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6} flexShrink={0}>
        <StatCard 
          icon={FiActivity} 
          label={t('history.stats.totalLearns')} 
          value={totalLearns} 
          helpText="Problems started"
        />
        <StatCard 
          icon={FiRepeat} 
          label={t('history.stats.totalReviews')} 
          value={totalReviews} 
          helpText="Reviews completed"
        />
        <StatCard 
          icon={FiCalendar} 
          label={t('history.stats.activeDays')} 
          value={activeDays} 
          helpText="Days active this year"
        />
      </SimpleGrid>

      {/* Main Content Split */}
      <Flex flex={1} gap={6} overflow="hidden" direction={{ base: 'column', xl: 'row' }}>
        
        {/* Left Main Column (Heatmap + Table) */}
        <VStack flex={1} spacing={6} h="full" overflow="hidden">
          
          {/* Heatmap Section - Fixed Height Container */}
          <Box
            w="full"
            bg={cardBg}
            boxShadow="sm"
            borderRadius="2xl"
            p={6}
            border="1px solid"
            borderColor={borderColor}
            className="calendar-container"
            flexShrink={0}
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
              .calendar-container .react-calendar-heatmap rect { rx: 3px; ry: 3px; }
              .calendar-container text { font-size: 10px; fill: gray; }
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

          {/* History Table Section - Flexible Height */}
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
        </VStack>

        {/* Right Sidebar: Selected Day Stream */}
        <Box 
          w={{ base: 'full', xl: '380px' }} 
          h={{ base: '500px', xl: 'full' }}
          flexShrink={0}
          bg={cardBg}
          boxShadow="sm"
          borderRadius="2xl"
          p={6}
          border="1px solid"
          borderColor={borderColor}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
            <VStack align="start" spacing={1} mb={6} flexShrink={0}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                Activity Stream
              </Text>
              <Heading size="lg">
                {selectedDate?.date ? format(parseISO(selectedDate.date), 'MMM d') : 'Select a Date'}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {selectedDate?.date ? format(parseISO(selectedDate.date), 'EEEE, yyyy') : 'Click on the heatmap to view activities'}
              </Text>
            </VStack>
            
            <Box 
              flex={1} 
              overflowY="auto" 
              pr={2} 
              css={{
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { width: '6px' },
                '&::-webkit-scrollbar-thumb': { background: scrollbarThumbBg, borderRadius: '24px' },
              }}
            >
              {selectedDayActivities.length > 0 ? (
                <Box pt={2}>
                  {selectedDayActivities.map((item, index) => (
                    <TimelineItem
                      key={item.id}
                      item={item}
                      isLast={index === selectedDayActivities.length - 1}
                      onChartOpen={handleChartOpen}
                      onUndo={undoHistory}
                    />
                  ))}
                </Box>
              ) : (
                <Flex flex={1} align="center" justify="center" direction="column" color="gray.400" bg={emptyStateBg} borderRadius="xl" minH="200px" h="full">
                  <Icon as={FiCalendar} boxSize={10} mb={3} opacity={0.4} />
                  <Text fontSize="sm" fontWeight="medium">No activities on this day</Text>
                </Flex>
              )}
            </Box>
        </Box>

      </Flex> {/* End Main Content Split */}

      {/* Chart Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered returnFocusOnClose={false}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>
            {(i18n.language === 'zh' ? selectedProblemForChart?.title.zh : selectedProblemForChart?.title.en) || selectedProblemForChart?.title.en}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <ReviewHistoryChart problem={selectedProblemForChart} />
          </ModalBody>
        </ModalContent>
      </Modal>

    </Flex>
  );
}

export default HistoryBoard;
