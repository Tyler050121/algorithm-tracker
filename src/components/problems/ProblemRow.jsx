import React from 'react';
import {
  Badge,
  Box,
  HStack,
  IconButton,
  Link,
  Tag,
  Td,
  Text,
  Tooltip,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiBarChart2, FiBook, FiExternalLink } from 'react-icons/fi';
import { format, isValid, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import DifficultyBadge from '../common/DifficultyBadge';
import { DIFFICULTY_MAP } from '../../constants';

const STATUS_MAP = {
  unstarted: { label: 'Unstarted', color: 'neutral' },
  learning: { label: 'Learning', color: 'accent' },
  mastered: { label: 'Mastered', color: 'success' },
};

const parseDate = (value) => {
  if (!value) return null;
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) return null;
  return date;
};

export const RenderDateTag = ({ value, type = 'next' }) => {
  const { t } = useTranslation();
  const date = parseDate(value);
  if (!date) {
    return (
      <Tag size="sm" variant="solid" colorScheme="gray" opacity={0.7}>
        {type === 'first' ? t('problems.table.notLearned') : t('problems.table.toBeScheduled')}
      </Tag>
    );
  }
  const display = format(date, 'MM/dd');
  const weekday = format(date, 'EEE');
  const tooltip = format(date, 'yyyy-MM-dd (EEE)');
  const colorScheme = type === 'first' ? 'blue' : 'orange';
  return (
    <Tooltip label={tooltip} hasArrow>
      <Tag size="sm" colorScheme={colorScheme} variant="subtle">
        {display} · {weekday}
      </Tag>
    </Tooltip>
  );
};

const ProblemRow = React.memo(({ problem, onOpenSolutions, onOpenChart, rowHoverBg }) => {
  const { t, i18n } = useTranslation();
  const difficultyColor = DIFFICULTY_MAP[problem?.difficulty?.toLowerCase()]?.color ?? 'gray';
  const titleColor = useColorModeValue('gray.700', 'gray.200');
  
  if (!problem) return null;

  return (
    <Tr 
      _hover={{ bg: rowHoverBg }} 
      transition="all 0.2s"
      borderLeft="4px solid"
      borderLeftColor={`${difficultyColor}.400`}
    >
      <Td py={3}>
        <Text fontWeight="bold" color="gray.500" fontSize="sm" ml={2}>
          #{problem.id}
        </Text>
      </Td>
      <Td py={3}>
        <Box>
          <Text fontWeight="semibold" noOfLines={1} color={titleColor}>
            {i18n.language === 'zh' ? problem.title.zh : problem.title.en}
          </Text>
          <Text fontSize="xs" color="gray.500" mt={1}>
            {i18n.language === 'zh' ? problem.groupName.zh : problem.groupName.en}
          </Text>
        </Box>
      </Td>
      <Td textAlign="center" py={3}>
        <DifficultyBadge difficulty={problem.difficulty} />
      </Td>
      <Td textAlign="center" py={3}>
        <Badge colorScheme={STATUS_MAP[problem.status]?.color ?? 'gray'} variant="subtle" px={2} py={0.5} borderRadius="md" fontSize="xs">
          {t(
            `problems.status.${problem.status}`,
            STATUS_MAP[problem.status]?.label ?? 'Unknown'
          )}
        </Badge>
      </Td>
      <Td textAlign="center" py={3}>
        <RenderDateTag value={problem.learnHistory?.[0]?.date || null} type="first" />
      </Td>
      <Td textAlign="center" py={3}>
        <RenderDateTag value={problem.nextReviewDate} type="next" />
      </Td>
      <Td textAlign="center" py={3}>
        <HStack spacing={1} justify="center">
          {problem.slug ? (
            <Tooltip label={t('problems.table.openLink')} hasArrow>
              <Link href={`https://leetcode.cn/problems/${problem.slug}/`} isExternal _hover={{ textDecoration: 'none' }}>
                <IconButton
                  aria-label={t('problems.table.openLink')}
                  icon={<FiExternalLink />}
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                />
              </Link>
            </Tooltip>
          ) : (
            <IconButton aria-label="No Link" icon={<FiExternalLink />} size="sm" variant="ghost" isDisabled />
          )}
          
          <Tooltip label={t('common.viewSolutions')} hasArrow>
            <IconButton
              aria-label={t('common.viewSolutions')}
              icon={<FiBook />}
              size="sm"
              variant="ghost"
              colorScheme={problem.solutions?.length > 0 ? 'yellow' : 'gray'}
              opacity={problem.solutions?.length > 0 ? 1 : 0.3}
              onClick={() => onOpenSolutions(problem.id)}
            />
          </Tooltip>

          <Tooltip label={t('history.table.viewChart')} hasArrow>
            <IconButton
              aria-label={t('history.table.viewChart')}
              icon={<FiBarChart2 />}
              size="sm"
              variant="ghost"
              colorScheme="purple"
              onClick={() => onOpenChart(problem)}
            />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  );
});

ProblemRow.displayName = 'ProblemRow';

export default ProblemRow;
