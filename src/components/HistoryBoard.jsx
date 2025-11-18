import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import { subYears, format, parseISO } from 'date-fns';
import { FiActivity, FiRepeat, FiCalendar, FiRewind, FiEdit, FiBarChart2 } from 'react-icons/fi';
import ReviewHistoryChart from './ReviewHistoryChart';

const DIFFICULTY_MAP = {
  easy: 'green',
  medium: 'orange',
  hard: 'red',
};


// 统计卡片
function StatCard({ icon, label, value }) {
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  return (
    <Stat bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="xl" p={5}>
      <Flex align="center">
        <Icon as={icon} boxSize={8} color="teal.500" mr={4} />
        <Box>
          <StatLabel color="gray.500">{label}</StatLabel>
          <StatNumber>{value}</StatNumber>
        </Box>
      </Flex>
    </Stat>
  );
}

function HistoryBoard({ problems, onUndo, onUpdateDate }) {
  const { t } = useTranslation();
  const [isReadyToRender, setIsReadyToRender] = useState(false);
  const [selectedDate, setSelectedDate] = useState({ date: format(new Date(), 'yyyy-MM-dd') });
  const [newDate, setNewDate] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProblemForChart, setSelectedProblemForChart] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsReadyToRender(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleChartOpen = useCallback((problem) => {
    setSelectedProblemForChart(problem);
    onOpen();
  }, [onOpen]);

  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const emptyCellBg = useColorModeValue('gray.200', 'gray.600');

  const { allHistory, totalLearns, totalReviews, activeDays, historyByDate } = useMemo(() => {
    const history = [];
    const activity = new Map();
    const byDate = new Map();
    let recordCounter = 0;

    const processRecord = (problem, type, date) => {
      const record = {
        type,
        date,
        problem,
        id: `${problem.id}-${type}-${date}-${recordCounter}`,
      };
      recordCounter += 1;
      history.push(record);
      activity.set(date, (activity.get(date) || 0) + 1);
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date).push(record);
    };

    problems.forEach((p) => {
      p.learnHistory.forEach(date => processRecord(p, 'learn', date));
      p.reviewHistory.forEach(date => processRecord(p, 'review', date));
    });

    return {
      allHistory: history.sort((a, b) => new Date(b.date) - new Date(a.date)),
      totalLearns: history.filter(h => h.type === 'learn').length,
      totalReviews: history.filter(h => h.type === 'review').length,
      activeDays: activity.size,
      historyByDate: byDate,
    };
  }, [problems]);

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
        <Link as={RouterLink} to="/" color="teal.500" fontWeight="bold">
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
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="xl"
            p={6}
            className="calendar-container"
          >
            <style>{`
              .calendar-container .react-calendar-heatmap .color-empty { fill: ${emptyCellBg}; }
              .calendar-container .react-calendar-heatmap .color-scale-1 { fill: #a7f3d0; }
              .calendar-container .react-calendar-heatmap .color-scale-2 { fill: #6ee7b7; }
              .calendar-container .react-calendar-heatmap .color-scale-3 { fill: #34d399; }
              .calendar-container .react-calendar-heatmap .color-scale-4 { fill: #10b981; }
              .calendar-container .react-calendar-heatmap rect:focus { outline: none; }
            `}</style>
            <Heading size="md" mb={4}>{t('history.calendar.title')}</Heading>
            <CalendarHeatmap
              startDate={subYears(new Date(), 1)}
              endDate={new Date()}
              values={heatmapData}
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
        <GridItem as={Box} bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="xl" p={6}>
          <VStack align="stretch" h="100%">
            <Heading size="md" mb={4}>
              {selectedDate ? format(parseISO(selectedDate.date), 'yyyy-MM-dd') : t('history.selectedDay.title')}
            </Heading>
            <Divider mb={4} />
            <VStack spacing={4} align="stretch" flex={1} overflowY="auto">
              {selectedDayActivities.length > 0 ? (
                selectedDayActivities.map((item) => (
                  <Grid key={item.id} templateColumns="4fr 2fr 2fr 2fr" gap={4} alignItems="center">
                    <GridItem minWidth={0}>
                      <Link as={RouterLink} to={`/problems?q=${item.problem.id}`} fontWeight="medium" title={item.problem.name} isTruncated>
                        {item.problem.name}
                      </Link>
                    </GridItem>
                    <GridItem textAlign="center">
                      <Badge colorScheme={DIFFICULTY_MAP[item.problem.difficulty]}>{item.problem.difficulty}</Badge>
                    </GridItem>
                    <GridItem textAlign="center">
                      <Tag colorScheme={item.type === 'learn' ? 'teal' : 'cyan'}>
                        {t(`history.actionType.${item.type}`)}
                      </Tag>
                    </GridItem>
                    <GridItem>
                      <HStack spacing={2} justify="center">
                        <Tooltip label={t('history.table.viewChart')}>
                          <IconButton icon={<FiBarChart2 />} size="xs" variant="ghost" onClick={() => handleChartOpen(item.problem)} />
                        </Tooltip>
                        <Tooltip label={t('common.undo')}>
                          <IconButton icon={<FiRewind />} size="xs" variant="ghost" colorScheme="red" onClick={() => onUndo(item)} />
                        </Tooltip>
                      </HStack>
                    </GridItem>
                  </Grid>
                ))
              ) : (
                <Text color="gray.500">
                  {selectedDate ? t('history.selectedDay.empty') : t('history.selectedDay.prompt')}
                </Text>
              )}
            </VStack>
          </VStack>
        </GridItem>
      </Grid>

      {/* Full History Table */}
      <Box bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="xl" p={6}>
        <Heading size="md" mb={4}>{t('history.table.title')}</Heading>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>{t('history.table.date')}</Th>
              <Th>ID</Th>
              <Th>{t('history.table.problem')}</Th>
              <Th textAlign="center">{t('problems.table.difficulty')}</Th>
              <Th textAlign="center">{t('history.table.type')}</Th>
              <Th textAlign="center">{t('common.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isReadyToRender && allHistory.map((item) => (
              <HistoryRow
                key={item.id}
                item={item}
                newDate={newDate}
                setNewDate={setNewDate}
                onUndo={onUndo}
                onUpdateDate={onUpdateDate}
                handleChartOpen={handleChartOpen}
              />
            ))}
          </Tbody>
        </Table>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedProblemForChart?.name} - {t('history.table.chartTitle')}</ModalHeader>
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
  const { t } = useTranslation();
  return (
    <Tr>
      <Td>{item.date}</Td>
      <Td>#{item.problem.id}</Td>
      <Td>
        <Link as={RouterLink} to={`/problems?q=${item.problem.id}`}>
          {item.problem.name}
        </Link>
      </Td>
      <Td textAlign="center">
        <Badge colorScheme={DIFFICULTY_MAP[item.problem.difficulty]}>{item.problem.difficulty}</Badge>
      </Td>
      <Td textAlign="center">
        <Tag colorScheme={item.type === 'learn' ? 'teal' : 'cyan'}>
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
            onOpen={() => setNewDate(item.date)}
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
                        type="date"
                        size="sm"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                      <ButtonGroup size="sm" alignSelf="flex-end">
                        <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                        <Button
                          colorScheme="teal"
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