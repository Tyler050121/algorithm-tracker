import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Icon,
  Flex,
  Grid,
  GridItem,
  Link,
  Tag,
  Divider,
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
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToken,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import { subYears, format, parseISO } from 'date-fns';
import { FiActivity, FiRepeat, FiCalendar, FiRewind, FiEdit, FiBarChart2, FiBookOpen, FiClock } from 'react-icons/fi';
import ReviewHistoryChart from '../components/ReviewHistoryChart';
import { useProblems } from '../context/ProblemContext';
import { useHistoryStats } from '../hooks/useHistoryStats';

const DIFFICULTY_MAP = {
  easy: 'green',
  medium: 'orange',
  hard: 'red',
};

// 统计卡片
function StatCard({ icon, label, value }) {
  const cardBg = useColorModeValue('white', 'gray.700');
  // Removed border
  return (
    <Stat bg={cardBg} boxShadow="sm" borderRadius="xl" p={5} transition="all 0.3s ease" _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}>
      <Flex align="center">
        <Icon as={icon} boxSize={8} color="brand.500" mr={4} />
        <Box>
          <StatLabel color="gray.500">{label}</StatLabel>
          <StatNumber>{value}</StatNumber>
        </Box>
      </Flex>
    </Stat>
  );
}

function HistoryBoard() {
  const { t, i18n } = useTranslation();
  const { undoHistory, updateHistoryDate } = useProblems();
  const historyData = useHistoryStats();
  const [selectedDate, setSelectedDate] = useState({ date: format(new Date(), 'yyyy-MM-dd') });
  const [newDate, setNewDate] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProblemForChart, setSelectedProblemForChart] = useState(null);

  const { allHistory, totalLearns, totalReviews, activeDays, historyByDate } = historyData || { allHistory: [], totalLearns: 0, totalReviews: 0, activeDays: 0, historyByDate: new Map() };

  const handleChartOpen = useCallback((problem) => {
    setSelectedProblemForChart(problem);
    onOpen();
  }, [onOpen]);

  const cardBg = useColorModeValue('white', 'gray.700');
  // Removed cardBorder
  const dailyItemBg = useColorModeValue('gray.50', 'gray.800');
  const scrollbarThumbBg = useColorModeValue('gray.200', 'gray.600');

  const emptyCellBgToken = useColorModeValue('gray.100', 'gray.600');
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

  if (!allHistory.length) {
    return (
      <VStack spacing={4} align="center" justify="center" h="50vh">
        <Heading size="lg">{t('history.noRecords.title')}</Heading>
        <Text>{t('history.noRecords.description')}</Text>
        <Link as={RouterLink} to="/" color="brand.500" fontWeight="bold">
          {t('history.noRecords.cta')}
        </Link>
      </VStack>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      <Grid templateColumns={{ base: '1fr', lg: '2.5fr 1.5fr' }} gap={8} alignItems="stretch">
        {/* Left Side */}
        <GridItem as={VStack} spacing={8} align="stretch">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <StatCard icon={FiActivity} label={t('history.stats.totalLearns')} value={totalLearns} />
            <StatCard icon={FiRepeat} label={t('history.stats.totalReviews')} value={totalReviews} />
            <StatCard icon={FiCalendar} label={t('history.stats.activeDays')} value={activeDays} />
          </SimpleGrid>
          <Box
            bg={cardBg}
            boxShadow="sm"
            borderRadius="xl"
            p={6}
            className="calendar-container"
          >
            <style>{`
              .calendar-container .react-calendar-heatmap .color-empty { fill: ${emptyCellBg} !important; }
              .calendar-container .react-calendar-heatmap .color-scale-1 { fill: ${heatMapScale1}; }
              .calendar-container .react-calendar-heatmap .color-scale-2 { fill: ${heatMapScale2}; }
              .calendar-container .react-calendar-heatmap .color-scale-3 { fill: ${heatMapScale3}; }
              .calendar-container .react-calendar-heatmap .color-scale-4 { fill: ${heatMapScale4}; }
              .calendar-container .react-calendar-heatmap rect:focus { outline: none; }
              .calendar-container .react-calendar-heatmap rect { rx: 2px; ry: 2px; }
            `}</style>
            <Heading size="md" mb={4}>{t('history.calendar.title')}</Heading>
            <CalendarHeatmap
              startDate={subYears(new Date(), 1)}
              endDate={new Date()}
              values={heatmapData}
              gutterSize={3}
              classForValue={(value) => {
                if (!value || value.count === 0) return 'color-empty';
                return `color-scale-${Math.min(value.count, 4)}`;
              }}
              tooltipDataAttrs={value => ({
                'data-tooltip-id': 'heatmap-tooltip',
                'data-tooltip-content': value.date ? `${value.date} - ${value.count} activities` : 'No activity',
              })}
              onClick={value => setSelectedDate(value)}
            />
            <ReactTooltip id="heatmap-tooltip" />
          </Box>
        </GridItem>

        {/* Right Side */}
        <GridItem position="relative" display="flex" flexDirection="column">
          <Box
            bg={cardBg}
            boxShadow="sm"
            borderRadius="xl"
            p={6}
            display="flex"
            flexDirection="column"
            position={{ base: 'static', lg: 'absolute' }}
            top={0}
            bottom={0}
            left={0}
            right={0}
          >
            <VStack align="stretch" h="100%">
              <Heading size="md" mb={4} flexShrink={0}>
                {selectedDate ? format(parseISO(selectedDate.date), 'yyyy-MM-dd') : t('history.selectedDay.title')}
              </Heading>
              <Divider mb={4} />
              <VStack spacing={4} align="stretch" flex={1} overflowY="auto" pr={2} css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: scrollbarThumbBg,
                  borderRadius: '24px',
                },
              }}>
                {selectedDayActivities.length > 0 ? (
                  selectedDayActivities.map((item) => (
                    <Flex
                      key={item.id}
                      p={4}
                      bg={dailyItemBg}
                      borderRadius="lg"
                      alignItems="center"
                      justify="space-between"
                      borderLeft="4px solid"
                      borderColor={`${DIFFICULTY_MAP[item.problem.difficulty?.toLowerCase()] || 'gray'}.400`}
                      boxShadow="sm"
                      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                      transition="all 0.2s"
                    >
                      <VStack align="start" spacing={2} flex={1} minWidth={0}>
                        <Text fontWeight="bold" fontSize="sm" noOfLines={1} title={(i18n.language === 'zh' ? item.problem.title.zh : item.problem.title.en) || item.problem.title.en}>
                          {(i18n.language === 'zh' ? item.problem.title.zh : item.problem.title.en) || item.problem.title.en}
                        </Text>
                        <HStack spacing={3}>
                          <Tag colorScheme={item.type === 'learn' ? 'brand' : 'accent'} size="sm" variant="subtle">
                            {t(`history.actionType.${item.type}`)}
                          </Tag>
                          <HStack spacing={1} color="gray.500" fontSize="xs">
                            <Icon as={FiClock} />
                            <Text>{format(parseISO(item.date), 'HH:mm')}</Text>
                          </HStack>
                          {item.plan && (
                            <Tooltip label={t(`study_plans.${item.plan}.name`, item.plan)}>
                              <HStack spacing={1} color="gray.500" fontSize="xs" display={{ base: 'none', sm: 'flex' }}>
                                <Icon as={FiBookOpen} />
                                <Text maxW="60px" noOfLines={1}>{t(`study_plans.${item.plan}.name`, item.plan)}</Text>
                              </HStack>
                            </Tooltip>
                          )}
                        </HStack>
                      </VStack>
                      <HStack spacing={1} ml={2}>
                        <Tooltip label={t('history.table.viewChart')}>
                          <IconButton icon={<FiBarChart2 />} size="xs" variant="ghost" onClick={() => handleChartOpen(item.problem)} />
                        </Tooltip>
                        <Tooltip label={t('common.undo')}>
                          <IconButton icon={<FiRewind />} size="xs" variant="ghost" colorScheme="red" onClick={() => undoHistory(item)} />
                        </Tooltip>
                      </HStack>
                    </Flex>
                  ))
                ) : (
                  <Flex flex={1} align="center" justify="center" direction="column" color="gray.500">
                    <Icon as={FiCalendar} boxSize={8} mb={2} opacity={0.5} />
                    <Text>
                      {selectedDate ? t('history.selectedDay.empty') : t('history.selectedDay.prompt')}
                    </Text>
                  </Flex>
                )}
              </VStack>
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      {/* Full History Table */}
      <Box bg={cardBg} boxShadow="sm" borderRadius="xl" p={6}>
        <Heading size="md" mb={4}>{t('history.table.title')}</Heading>
        <Table variant="simple" size="sm" tableLayout="fixed">
          <Thead>
            <Tr>
              <Th width="110px" textAlign="center" px={2}>{t('history.table.date')}</Th>
              <Th width="80px" px={2}>ID</Th>
              <Th width="45%">{t('history.table.problem')}</Th>
              <Th width="120px" textAlign="center" px={2}>{t('history.table.plan')}</Th>
              <Th width="110px" textAlign="center" px={2}>{t('problems.table.difficulty')}</Th>
              <Th width="110px" textAlign="center" px={2}>{t('history.table.type')}</Th>
              <Th width="120px" textAlign="center">{t('common.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {allHistory.map((item) => (
              <HistoryRow
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
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{(i18n.language === 'zh' ? selectedProblemForChart?.title.zh : selectedProblemForChart?.title.en) || selectedProblemForChart?.title.en} - {t('history.table.chartTitle')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ReviewHistoryChart problem={selectedProblemForChart} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

export default HistoryBoard;

const HistoryRow = React.memo(({ item, newDate, setNewDate, onUndo, onUpdateDate, handleChartOpen }) => {
  const { t, i18n } = useTranslation();
  const fullDate = useMemo(() => format(parseISO(item.date), 'yyyy-MM-dd HH:mm:ss'), [item.date]);
  const shortDate = useMemo(() => format(parseISO(item.date), 'MM-dd'), [item.date]);

  return (
    <Tr>
      <Td textAlign="center">
        <Tooltip label={fullDate} hasArrow placement="top">
          <Tag colorScheme="gray" size="sm">{shortDate}</Tag>
        </Tooltip>
      </Td>
      <Td px={2}>#{item.problem.id}</Td>
      <Td>
        <Text noOfLines={1} title={(i18n.language === 'zh' ? item.problem.title.zh : item.problem.title.en) || item.problem.title.en}>
          {(i18n.language === 'zh' ? item.problem.title.zh : item.problem.title.en) || item.problem.title.en}
        </Text>
      </Td>
      <Td textAlign="center" px={2}>
        {item.plan ? (
          <Text fontSize="xs" noOfLines={1} color="gray.600" title={t(`study_plans.${item.plan}.name`, item.plan)}>
            {t(`study_plans.${item.plan}.name`, item.plan)}
          </Text>
        ) : (
          <Text color="gray.400">-</Text>
        )}
      </Td>
      <Td textAlign="center" px={2}>
        <Badge
          colorScheme={DIFFICULTY_MAP[item.problem.difficulty?.toLowerCase()]}
          variant="subtle"
          textTransform="capitalize"
        >
          {item.problem.difficulty}
        </Badge>
      </Td>
      <Td textAlign="center" px={2}>
        <Tag colorScheme={item.type === 'learn' ? 'brand' : 'accent'} size="sm">
          {t(`history.actionType.${item.type}`)}
        </Tag>
      </Td>
      <Td textAlign="center">
        <HStack spacing={2} justify="center">
          <Tooltip label={t('history.table.viewChart')}>
            <IconButton icon={<FiBarChart2 />} size="xs" variant="ghost" onClick={() => handleChartOpen(item.problem)} />
          </Tooltip>
          <Popover
            placement="left"
            onOpen={() => setNewDate(format(parseISO(item.date), "yyyy-MM-dd'T'HH:mm"))}
          >
            {({ onClose }) => (
              <>
                <PopoverTrigger>
                  <IconButton icon={<FiEdit />} size="xs" variant="ghost" />
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
            <IconButton icon={<FiRewind />} size="xs" variant="ghost" colorScheme="red" onClick={() => onUndo(item)} />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  );
});

HistoryRow.displayName = 'HistoryRow';