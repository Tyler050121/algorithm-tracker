import React from 'react';
import {
  Badge,
  Box,
  Circle,
  Flex,
  HStack,
  IconButton,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { FiBarChart2, FiRewind } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import DifficultyBadge from '../common/DifficultyBadge';
import { DIFFICULTY_MAP } from '../../constants';

const TimelineItem = ({ item, isLast, onChartOpen, onUndo }) => {
  const { t, i18n } = useTranslation();
  const timeColor = useColorModeValue('gray.400', 'gray.500');
  const lineColor = useColorModeValue('gray.200', 'gray.700');
  const titleColor = useColorModeValue('gray.800', 'gray.100');
  const cardBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  
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
              <DifficultyBadge difficulty={item.problem.difficulty} fontSize="xs" />
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

export default TimelineItem;
