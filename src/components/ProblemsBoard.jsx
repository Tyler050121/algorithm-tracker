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
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { format, isValid, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

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

function ProblemsBoard({ problems, search, setSearch, onOpenSolutions }) {
  const { t } = useTranslation();
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.100', 'gray.700');
  const inputBg = useColorModeValue('gray.50', 'gray.900');
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  return (
    <Box bg={cardBg} border="1px solid" borderColor={border} borderRadius="xl" p={6}>
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" mb={4} gap={4}>
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

      <Box overflowX="auto">
        <Table size="md" variant="simple">
          <Thead>
            <Tr>
              <Th width="80px" textAlign="left">{t('problems.table.id')}</Th>
              <Th textAlign="left">{t('problems.table.name')}</Th>
              <Th width="120px" textAlign="center">{t('problems.table.difficulty')}</Th>
              <Th width="140px" textAlign="center">{t('problems.table.link')}</Th>
              <Th width="140px" textAlign="center">{t('problems.table.status')}</Th>
              <Th width="150px" textAlign="center">{t('problems.table.firstLearn')}</Th>
              <Th width="150px" textAlign="center">{t('problems.table.nextReview')}</Th>
              <Th width="80px" textAlign="center">{t('problems.table.solutions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {problems.map((problem) => (
              <Tr key={problem.id} _hover={{ bg: rowHoverBg }}>
                <Td fontWeight="semibold">#{problem.id}</Td>
                <Td>{problem.name}</Td>
                <Td textAlign="center">
                  <Tag
                    size="sm"
                    colorScheme={DIFFICULTY_MAP[problem.difficulty]?.color ?? 'gray'}
                    variant="subtle"
                  >
                    {t(`problems.difficulty.${problem.difficulty}`, DIFFICULTY_MAP[problem.difficulty]?.label ?? 'Unknown')}
                  </Tag>
                </Td>
                <Td textAlign="center">
                  {problem.link ? (
                    <Link
                      href={problem.link}
                      isExternal
                      color="teal.500"
                      fontSize="sm"
                    >
                      {t('problems.table.openLink')}
                    </Link>
                  ) : (
                    <Text fontSize="sm" color="gray.400">
                      {t('problems.table.noLink')}
                    </Text>
                  )}
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme={STATUS_MAP[problem.status]?.color ?? 'gray'}>
                    {t(`problems.status.${problem.status}`, STATUS_MAP[problem.status]?.label ?? 'Unknown')}
                  </Badge>
                </Td>
                <Td textAlign="center"><RenderDateTag value={problem.learnHistory?.[0] ?? problem.startDate} type="first" /></Td>
                <Td textAlign="center"><RenderDateTag value={problem.nextReviewDate} type="next" /></Td>
                <Td textAlign="center">
                  <IconButton
                    aria-label={t('problems.table.viewSolutions')}
                    icon={<ExternalLinkIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="teal"
                    onClick={() => onOpenSolutions(problem.id)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {problems.length === 0 && (
          <Text textAlign="center" color="gray.500" py={6}>
            {t('problems.empty')}
          </Text>
        )}
      </Box>
    </Box>
  );
}

export default ProblemsBoard;
