import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Badge,
  Box,
  Flex,
  Grid,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Tag,
  Tooltip,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { FaBookOpen } from 'react-icons/fa';
import { format, isValid, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { List } from 'react-window';

const STATUS_MAP = {
  unstarted: { label: 'Unstarted', color: 'gray' },
  learning: { label: 'Learning', color: 'teal' },
  mastered: { label: 'Mastered', color: 'purple' },
};

const DIFFICULTY_MAP = {
  easy: { label: 'Easy', color: 'green' },
  medium: { label: 'Medium', color: 'orange' },
  hard: { label: 'Hard', color: 'red' },
};

const parseDate = (value) => {
  if (!value) return null;
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) return null;
  return date;
};

const RenderDateTag = ({ value, type = 'next' }) => {
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

const COLUMN_TEMPLATE = '80px minmax(220px, 3fr) 120px 140px 140px 160px 160px 80px';
const PROBLEM_ROW_HEIGHT = 64;
const DEFAULT_LIST_HEIGHT = PROBLEM_ROW_HEIGHT * 6;
const VIEWPORT_BOTTOM_OFFSET = 48;

const ProblemRow = React.memo(({ index, style, problems, onOpenSolutions, rowHoverBg, ariaAttributes }) => {
  const { t, i18n } = useTranslation();
  const problem = problems[index];
  const difficultyColorScheme = DIFFICULTY_MAP[problem?.difficulty?.toLowerCase()]?.color ?? 'gray';
  const accentColor = useColorModeValue(`${difficultyColorScheme}.300`, `${difficultyColorScheme}.500`);
  const stripedBg = useColorModeValue(index % 2 === 0 ? 'white' : 'gray.50', index % 2 === 0 ? 'gray.800' : 'gray.900');
  const dividerColor = useColorModeValue('gray.100', 'whiteAlpha.200');
  if (!problem) return null;

  return (
    <Box style={{ ...style, minWidth: '100%' }}>
      <Grid
        templateColumns={COLUMN_TEMPLATE}
        alignItems="center"
        px={4}
        py={3}
        bg={stripedBg}
        borderBottom="1px solid"
        borderColor={dividerColor}
        borderLeft="4px solid"
        borderLeftColor={accentColor}
        borderRadius="md"
        transition="all 0.3s ease"
        _hover={{ bg: rowHoverBg, transform: 'translateY(-1px)', shadow: 'sm' }}
        role="row"
        {...ariaAttributes}
      >
        <Text fontWeight="semibold" color="gray.600" _dark={{ color: 'gray.300' }}>
          #{problem.id}
        </Text>
        <Box>
          <Text fontWeight="medium" noOfLines={1}>
            {i18n.language === 'zh' ? problem.title.zh : problem.title.en}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {i18n.language === 'zh' ? problem.groupName.zh : problem.groupName.en}
          </Text>
        </Box>
        <Flex justify="center">
          <Tag size="sm" colorScheme={difficultyColorScheme} variant="subtle">
            {t(
              `problems.difficulty.${problem.difficulty?.toLowerCase()}`,
              DIFFICULTY_MAP[problem.difficulty?.toLowerCase()]?.label ?? 'Unknown'
            )}
          </Tag>
        </Flex>
        <Box textAlign="center">
          {problem.slug ? (
            <Link href={`https://leetcode.cn/problems/${problem.slug}/`} isExternal color="teal.500" fontSize="sm" fontWeight="semibold">
              {t('problems.table.openLink')}
            </Link>
          ) : (
            <Text fontSize="sm" color="gray.400">
              {t('problems.table.noLink')}
            </Text>
          )}
        </Box>
        <Flex justify="center">
          <Badge colorScheme={STATUS_MAP[problem.status]?.color ?? 'gray'} variant="subtle" px={3} py={1} borderRadius="full">
            {t(
              `problems.status.${problem.status}`,
              STATUS_MAP[problem.status]?.label ?? 'Unknown'
            )}
          </Badge>
        </Flex>
        <Flex justify="center">
          <RenderDateTag value={problem.learnHistory?.[0]?.date || null} type="first" />
        </Flex>
        <Flex justify="center">
          <RenderDateTag value={problem.nextReviewDate} type="next" />
        </Flex>
        <Box textAlign="center">
          <Tooltip label={t('problems.table.viewSolutions')} hasArrow closeOnClick={true} openDelay={500}>
            <IconButton
              aria-label={t('problems.table.viewSolutions')}
              icon={<FaBookOpen />}
              size="sm"
              variant="ghost"
              colorScheme={problem.solutions?.length > 0 ? 'yellow' : 'gray'}
              onClick={() => onOpenSolutions(problem.id)}
            />
          </Tooltip>
        </Box>
      </Grid>
    </Box>
  );
});

ProblemRow.displayName = 'ProblemRow';

import { useProblems } from '../context/ProblemContext';

function ProblemsBoard({ onOpenSolutions }) {
  const { t } = useTranslation();
  const { problems: allProblems } = useProblems();
  const [search, setSearch] = useState('');
  const { i18n } = useTranslation();

  const problems = useMemo(
    () =>
      allProblems.filter((p) => {
        const title = (i18n.language === 'zh' ? p.title.zh : p.title.en) || '';
        return title.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search.trim());
      }),
    [allProblems, search, i18n.language]
  );

  const [availableHeight, setAvailableHeight] = useState(DEFAULT_LIST_HEIGHT);
  const listContainerRef = useRef(null);
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.900');
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const headerBg = useColorModeValue('rgba(249, 250, 251, 0.95)', 'rgba(26, 32, 44, 0.9)');
  const headerColor = useColorModeValue('gray.600', 'gray.300');
  const headerBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const listBg = useColorModeValue('white', 'gray.900');

  useEffect(() => {
    const updateHeight = () => {
      if (listContainerRef.current) {
        setAvailableHeight(listContainerRef.current.clientHeight);
      }
    };

    updateHeight();
    
    // Use ResizeObserver for more robust height tracking
    const observer = new ResizeObserver(updateHeight);
    if (listContainerRef.current) {
      observer.observe(listContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const problemRowProps = useMemo(
    () => ({ problems, onOpenSolutions, rowHoverBg }),
    [problems, onOpenSolutions, rowHoverBg]
  );

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
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" mb={4} gap={4} flexShrink={0}>
        <Box>
          <Text fontWeight="semibold" fontSize="lg">
            {t('problems.title')}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {t('problems.subtitle')}
          </Text>
        </Box>
        <InputGroup maxW={{ base: 'full', md: '320px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder={t('problems.searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            bg={inputBg}
          />
        </InputGroup>
      </Flex>

      <Box flex="1" overflow="hidden" position="relative">
        <Box position="absolute" top={0} left={0} right={0} bottom={0} overflowX="auto" overflowY="hidden">
          <Box minW="1000px" h="100%" display="flex" flexDirection="column" border="1px solid" borderColor={border} borderRadius="lg" overflow="hidden">
            <Grid
              templateColumns={COLUMN_TEMPLATE}
              bg={headerBg}
              color={headerColor}
              fontWeight="semibold"
              textTransform="uppercase"
              letterSpacing="wide"
              fontSize="xs"
              px={4}
              py={3}
              flexShrink={0}
              zIndex={1}
              backdropFilter="blur(8px)"
              borderBottom="1px solid"
              borderColor={headerBorder}
              boxShadow="sm"
              transition="all 0.3s ease"
            >
              <Text>{t('problems.table.id')}</Text>
              <Text>{t('problems.table.name')}</Text>
              <Text textAlign="center">{t('problems.table.difficulty')}</Text>
              <Text textAlign="center">{t('problems.table.link')}</Text>
              <Text textAlign="center">{t('problems.table.status')}</Text>
              <Text textAlign="center">{t('problems.table.firstLearn')}</Text>
              <Text textAlign="center">{t('problems.table.nextReview')}</Text>
              <Text textAlign="center">{t('problems.table.solutions')}</Text>
            </Grid>
            {problems.length > 0 ? (
              <Box bg={listBg} position="relative" flex="1" ref={listContainerRef} minH={0}>
                <List
                  rowComponent={ProblemRow}
                  rowCount={problems.length}
                  rowHeight={PROBLEM_ROW_HEIGHT}
                  rowProps={problemRowProps}
                  height={availableHeight}
                  width="100%"
                  style={{ width: '100%' }}
                />
              </Box>
            ) : (
              <Flex direction="column" align="center" justify="center" py={10} gap={2} flex="1">
                <Text fontWeight="semibold" color="gray.600" _dark={{ color: 'gray.300' }}>
                  {t('problems.empty')}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {t('problems.subtitle')}
                </Text>
              </Flex>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ProblemsBoard;
