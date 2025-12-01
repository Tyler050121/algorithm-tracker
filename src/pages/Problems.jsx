import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Tag,
  Tooltip,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FiBook, FiExternalLink, FiBarChart2 } from 'react-icons/fi';
import { format, isValid, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import ReviewHistoryChart from '../components/ReviewHistoryChart';

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
        <Tag size="sm" colorScheme={difficultyColor} variant="subtle" borderRadius="full">
          {t(
            `problems.difficulty.${problem.difficulty?.toLowerCase()}`,
            DIFFICULTY_MAP[problem.difficulty?.toLowerCase()]?.label ?? 'Unknown'
          )}
        </Tag>
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

import { useProblems } from '../context/ProblemContext';

function ProblemsBoard({ onOpenSolutions }) {
  const { t } = useTranslation();
  const { problems: allProblems } = useProblems();
  const [search, setSearch] = useState('');
  const { i18n } = useTranslation();
  
  // Chart Modal State
  const { isOpen: isChartOpen, onOpen: onChartOpen, onClose: onChartClose } = useDisclosure();
  const [selectedProblemForChart, setSelectedProblemForChart] = useState(null);

  const handleChartOpen = useCallback((problem) => {
    setSelectedProblemForChart(problem);
    onChartOpen();
  }, [onChartOpen]);

  // Infinite scroll state
  const [displayCount, setDisplayCount] = useState(15);
  const scrollContainerRef = useRef(null);

  const problems = useMemo(
    () =>
      allProblems.filter((p) => {
        const title = (i18n.language === 'zh' ? p.title.zh : p.title.en) || '';
        return title.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search.trim());
      }),
    [allProblems, search, i18n.language]
  );

  // Reset display count when search changes
  useEffect(() => {
    setDisplayCount(15);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [search]);

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 300) {
      setDisplayCount(prev => Math.min(prev + 15, problems.length));
    }
  }, [problems.length]);

  const displayedProblems = useMemo(() => problems.slice(0, displayCount), [problems, displayCount]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.900');
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const headerBg = useColorModeValue('white', 'gray.800');
  const scrollbarThumbBg = useColorModeValue('gray.200', 'gray.600');

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

      <Box 
        flex="1" 
        overflow="hidden" 
        position="relative" 
        border="1px solid" 
        borderColor={border} 
        borderRadius="lg"
      >
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          overflowY="auto"
          onScroll={handleScroll}
          ref={scrollContainerRef}
          css={{
            '&::-webkit-scrollbar': { width: '4px', height: '4px' },
            '&::-webkit-scrollbar-track': { width: '6px' },
            '&::-webkit-scrollbar-thumb': { background: scrollbarThumbBg, borderRadius: '24px' },
            overscrollBehavior: 'contain',
          }}
        >
          <Table variant="unstyled" size="md">
            <Thead position="sticky" top={0} bg={headerBg} zIndex={10} shadow="sm">
              <Tr>
                <Th width="80px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.id')}</Th>
                <Th minW="220px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.name')}</Th>
                <Th textAlign="center" width="120px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.difficulty')}</Th>
                <Th textAlign="center" width="140px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.status')}</Th>
                <Th textAlign="center" width="160px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.firstLearn')}</Th>
                <Th textAlign="center" width="160px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.nextReview')}</Th>
                <Th textAlign="center" width="140px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('common.actions')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {displayedProblems.length > 0 ? (
                displayedProblems.map((problem) => (
                  <ProblemRow
                    key={problem.id}
                    problem={problem}
                    onOpenSolutions={onOpenSolutions}
                    onOpenChart={handleChartOpen}
                    rowHoverBg={rowHoverBg}
                  />
                ))
              ) : (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={10}>
                    <Text fontWeight="semibold" color="gray.600" _dark={{ color: 'gray.300' }}>
                      {t('problems.empty')}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {t('problems.subtitle')}
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Chart Modal */}
      <Modal isOpen={isChartOpen} onClose={onChartClose} size="xl" isCentered returnFocusOnClose={false}>
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
    </Box>
  );
}

export default ProblemsBoard;
