import React from 'react';
import {
  Box,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ProblemRow from './ProblemRow';

const ProblemsTable = React.forwardRef((props, ref) => {
  const { 
    displayedProblems, 
    handleScroll, 
    onOpenSolutions, 
    handleChartOpen 
  } = props;
  const { t } = useTranslation();

  // 颜色配置
  const border = useColorModeValue('gray.100', 'gray.700');
  const rowHoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const headerBg = useColorModeValue('white', 'gray.800');
  const scrollbarThumbBg = useColorModeValue('gray.200', 'gray.600');

  return (
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
        overflowX="auto"
        onScroll={handleScroll}
        ref={ref}
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
              <Th whiteSpace="nowrap" width="80px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.id')}</Th>
              <Th whiteSpace="nowrap" minW="220px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.name')}</Th>
              <Th whiteSpace="nowrap" textAlign="center" width="120px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.difficulty')}</Th>
              <Th whiteSpace="nowrap" textAlign="center" width="140px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.status')}</Th>
              <Th whiteSpace="nowrap" textAlign="center" width="160px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.firstLearn')}</Th>
              <Th whiteSpace="nowrap" textAlign="center" width="160px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('problems.table.nextReview')}</Th>
              <Th whiteSpace="nowrap" textAlign="center" width="140px" py={4} fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wider">{t('common.actions')}</Th>
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
  );
});

ProblemsTable.displayName = 'ProblemsTable';

export default ProblemsTable;
