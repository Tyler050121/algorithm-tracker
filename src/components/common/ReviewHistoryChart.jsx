import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Divider,
  Flex,
  HStack,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import ReviewProgressBars from '../history/ReviewProgressBars';
import { TypeTag } from '../history/HistoryBadges';

function ReviewHistoryChart({ problem }) {
  const { t } = useTranslation();
  const [selectedStep, setSelectedStep] = useState(null);
  const clearTimerRef = useRef(null);

  const FLASH_MS = 1100;
  const CLEAR_AFTER_MS = FLASH_MS * 3;

  useEffect(() => {
    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    if (typeof selectedStep !== 'number') return;

    clearTimerRef.current = window.setTimeout(() => {
      setSelectedStep(null);
      clearTimerRef.current = null;
    }, CLEAR_AFTER_MS);

    return () => {
      if (clearTimerRef.current) {
        window.clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
    };
  }, [selectedStep]);

  const events = useMemo(() => {
    if (!problem) return [];
    const list = [];
    (problem.learnHistory || []).forEach((item) =>
      list.push({ date: typeof item === 'string' ? item : item.date, type: 'learn', plan: item?.plan }),
    );
    (problem.reviewHistory || []).forEach((item) =>
      list.push({ date: typeof item === 'string' ? item : item.date, type: 'review', plan: item?.plan }),
    );
    return list
      .filter((e) => !!e.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [problem]);

  const cardBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const subtle = useColorModeValue('gray.600', 'gray.400');
  const value = useColorModeValue('gray.900', 'gray.100');
  const rowHover = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');

  if (!problem || events.length === 0) {
    return (
      <Flex justify="center" align="center" h="150px">
        <Text color={subtle}>{t('history.noRecords.title')}</Text>
      </Flex>
    );
  }

  const learnedAt = events.find((e) => e.type === 'learn')?.date;
  const reviewCount = (problem.reviewHistory || []).length;
  const nextReviewDate = problem.nextReviewDate;

  // Steps: learn (index 0) + each review in chronological order (index 1..N)
  const learnEvent = events.find((e) => e.type === 'learn') ?? null;
  const reviewEvents = events.filter((e) => e.type === 'review');
  const steps = [learnEvent, ...reviewEvents].filter(Boolean);
  const selectedEvent =
    typeof selectedStep === 'number' && steps[selectedStep]
      ? steps[selectedStep]
      : null;

  return (
    <VStack align="stretch" spacing={5} w="full" p={1}>
      <VStack align="start" spacing={2}>
        <HStack w="full" spacing={3} justify="space-between" wrap="wrap" rowGap={2}>
          <HStack spacing={3} fontSize="sm" color={subtle}>
            <Text fontWeight="bold">{t('history.table.viewChart')}</Text>
            <HStack spacing={3} fontSize="xs" color={subtle}>
              <HStack spacing={1.5}>
                <Box w="8px" h="8px" borderRadius="full" bg={useColorModeValue('brand.600', 'brand.300')} />
                <Text>{t('history.actionType.learn')}</Text>
              </HStack>
              <HStack spacing={1.5}>
                <Box w="8px" h="8px" borderRadius="full" bg={useColorModeValue('accent.600', 'accent.300')} />
                <Text>{t('history.actionType.review')}</Text>
              </HStack>
            </HStack>
          </HStack>
        </HStack>

        <ReviewProgressBars
          problem={problem}
          size="md"
          selectedIndex={selectedStep ?? undefined}
          onSelectIndex={(idx) => setSelectedStep((prev) => (prev === idx ? null : idx))}
          enableHover={false}
        />
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
        <Box bg={cardBg} borderRadius="lg" p={3}>
          <Text fontSize="xs" color={subtle}>
            {t('history.detail.learningDate', 'Learning Date')}
          </Text>
          <Text fontSize="sm" fontWeight="bold" color={value}>
            {learnedAt ? format(parseISO(learnedAt), 'yyyy-MM-dd') : '-'}
          </Text>
        </Box>
        <Box bg={cardBg} borderRadius="lg" p={3}>
          <Text fontSize="xs" color={subtle}>
            {t('history.stats.totalReviews')}
          </Text>
          <Text fontSize="sm" fontWeight="bold" color={value}>
            {reviewCount}
          </Text>
        </Box>
        <Box bg={cardBg} borderRadius="lg" p={3}>
          <Text fontSize="xs" color={subtle}>
            {t('history.detail.nextReview', 'Next Review')}
          </Text>
          <Text fontSize="sm" fontWeight="bold" color={value}>
            {nextReviewDate || '-'}
          </Text>
        </Box>
      </SimpleGrid>

      <Divider />

      <VStack align="stretch" spacing={2}>
        <Text fontSize="sm" fontWeight="bold" color={value}>
          {t('history.detail.records', 'Records')}
        </Text>
        <VStack align="stretch" spacing={1}>
          {events
            .slice()
            .reverse()
            .map((e, idx) => {
              const ts = e.date ? parseISO(e.date) : null;
              const day = ts ? format(ts, 'yyyy-MM-dd') : '';
              const time = ts ? format(ts, 'HH:mm') : '';
              const isSelected =
                selectedEvent && selectedEvent.date === e.date && selectedEvent.type === e.type;
              return (
                <HStack
                  key={`${e.date}-${e.type}-${idx}`}
                  justify="space-between"
                  bg={isSelected ? rowHover : useColorModeValue('transparent', 'transparent')}
                  px={2}
                  py={2}
                  borderRadius="md"
                  _hover={{ bg: rowHover }}
                  onClick={() => {
                    const targetIndex = steps.findIndex(
                      (s) => s && s.date === e.date && s.type === e.type,
                    );
                    if (targetIndex >= 0) {
                      setSelectedStep(targetIndex);
                    }
                  }}
                  cursor="pointer"
                >
                  <HStack spacing={2} minW={0}>
                    <TypeTag type={e.type} label={t(`history.actionType.${e.type}`)} />
                    <Text fontSize="sm" color={value} noOfLines={1}>
                      {day}
                      {time ? ` ${time}` : ''}
                    </Text>
                  </HStack>
                  {e.plan ? (
                    <Text fontSize="xs" color={subtle} noOfLines={1} maxW="40%">
                      {e.plan}
                    </Text>
                  ) : null}
                </HStack>
              );
            })}
        </VStack>
      </VStack>
    </VStack>
  );
}

export default ReviewHistoryChart;