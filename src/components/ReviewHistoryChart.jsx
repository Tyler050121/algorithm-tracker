import { useMemo } from 'react';
import { Box, Flex, Text, Tag, Icon, VStack } from '@chakra-ui/react';
import { FiStar, FiRepeat } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

// 单个时间线事件的组件
function TimelineEvent({ type, date, isLast }) {
  const { t } = useTranslation();
  const isLearn = type === 'learn';
  const icon = isLearn ? FiStar : FiRepeat;
  const colorScheme = isLearn ? 'teal' : 'cyan';

  return (
    <Flex minH={20}>
      {/* 左侧的图标和竖线 */}
      <Flex direction="column" alignItems="center" mr={4}>
        <Icon as={icon} color={`${colorScheme}.500`} boxSize={6} zIndex={1} />
        {!isLast && <Box w="2px" flex="1" bg="gray.200" mt="-2px" />}
      </Flex>
      {/* 右侧的日期和类型 */}
      <VStack align="start" justify="center" spacing={1}>
        <Text fontWeight="bold" fontSize="md">
          {format(parseISO(date), 'yyyy-MM-dd')}
        </Text>
        <Tag colorScheme={colorScheme} size="sm">
          {t(`history.actionType.${type}`)}
        </Tag>
      </VStack>
    </Flex>
  );
}

// 主组件
function ReviewHistoryChart({ problem }) {
  const { t } = useTranslation();

  const timelineEvents = useMemo(() => {
    if (!problem) return [];
    const events = [];
    problem.learnHistory.forEach(item => events.push({ date: item.date, type: 'learn' }));
    problem.reviewHistory.forEach(item => events.push({ date: item.date, type: 'review' }));
    // 按时间正序排列，构建从上到下的时间线
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [problem]);

  if (!problem || timelineEvents.length === 0) {
    return (
      <Flex justify="center" align="center" h="150px">
        <Text color="gray.500">{t('history.noRecords.title')}</Text>
      </Flex>
    );
  }

  return (
    <Flex justify="center" w="100%" p={4}>
      <Box>
        {timelineEvents.map((event, index) => (
          <TimelineEvent
            key={`${event.date}-${event.type}-${index}`}
            type={event.type}
            date={event.date}
            isLast={index === timelineEvents.length - 1}
          />
        ))}
      </Box>
    </Flex>
  );
}

export default ReviewHistoryChart;