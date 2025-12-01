import React, { useState } from 'react';
import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  Tooltip as ChakraTooltip,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import { FaBookOpen } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ReviewListCard = ({ 
  toReviewToday, 
  onRecordReview, 
  onOpenSolutions, 
  todayStr 
}) => {
  const { t, i18n } = useTranslation();
  const [reviewLimit, setReviewLimit] = useState(10);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.100', 'gray.700');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  const reviewHoverBg = useColorModeValue('white', 'gray.700');

  const handleReviewScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Load more when user scrolls near bottom (50px threshold)
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setReviewLimit((prev) => (prev < toReviewToday.length ? prev + 10 : prev));
    }
  };

  return (
    <Box 
      flex={{ base: 'none', xl: 4.8 }} 
      minH={{ base: '500px', xl: 0 }}
      bg={cardBg} 
      borderRadius="2xl" 
      boxShadow="sm" 
      display="flex" 
      flexDirection="column" 
      overflow="hidden" 
      border="1px solid" 
      borderColor={cardBorderColor}
    >
        <Box p={5} pb={3} flexShrink={0} borderBottom="1px solid" borderColor={useColorModeValue('gray.100', 'gray.700')}>
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Flex p={2} bg="brand.50" color="brand.500" borderRadius="lg"><CheckCircleIcon boxSize={4} /></Flex>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">{t('dashboard.review.title')}</Text>
                  <Text fontSize="xs" color="gray.500">{t('dashboard.review.tomorrow')}</Text>
                </Box>
              </HStack>
              <Badge colorScheme="accent" fontSize="md" px={3} py={1} borderRadius="full">
                {t('dashboard.review.countBadge', { count: toReviewToday.length || '0' })}
              </Badge>
            </Flex>
        </Box>
        <Box 
          flex={1} 
          overflowY="auto" 
          p={4} 
          onScroll={handleReviewScroll}
          css={{ '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '3px' } }}
        >
          <Stack spacing={3}>
            {toReviewToday.length === 0 && (
              <Flex direction="column" align="center" justify="center" h="100%" color="gray.400">
                 <CheckCircleIcon boxSize={10} mb={2} opacity={0.5} />
                 <Text>{t('dashboard.review.empty')}</Text>
              </Flex>
            )}
            {toReviewToday.slice(0, reviewLimit).map((problem) => {
              const isOverdue = new Date(problem.nextReviewDate) < new Date(todayStr);
              return (
                <Box 
                  key={problem.id} 
                  p={4} 
                  borderRadius="xl" 
                  bg={subtleBg} 
                  borderLeft="4px solid" 
                  borderColor={isOverdue ? 'red.400' : 'brand.400'}
                  boxShadow="sm"
                  transition="all 0.2s"
                  _hover={{ transform: 'translateX(2px)', boxShadow: 'md', bg: reviewHoverBg }}
                >
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1} overflow="hidden" flex={1} mr={4}>
                      <HStack>
                         <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                           {(i18n.language === 'zh' ? problem.title.zh : problem.title.en) || problem.title.en}
                         </Text>
                         {isOverdue && <Badge colorScheme="red" variant="solid" fontSize="0.6rem">OVERDUE</Badge>}
                      </HStack>
                      <HStack spacing={3} color="gray.500" fontSize="xs">
                         <Text>#{problem.id}</Text>
                         <Text>•</Text>
                         <Text>{t('dashboard.review.next', { date: problem.nextReviewDate })}</Text>
                      </HStack>
                    </VStack>
                    <HStack spacing={2}>
                      <ChakraTooltip label={t('dashboard.suggestions.openExternal')} hasArrow closeOnClick={true} openOnFocus={false}>
                         <IconButton 
                           icon={<ExternalLinkIcon />} 
                           variant="ghost" 
                           colorScheme="blue"
                           isRound
                           size="lg"
                           aria-label="Open Link"
                           _hover={{ bg: 'blue.50', color: 'blue.600' }}
                           onClick={(e) => {
                             e.preventDefault();
                             window.open(`https://leetcode.cn/problems/${problem.slug}/`, '_blank');
                             e.currentTarget.blur();
                           }}
                         />
                      </ChakraTooltip>
                      <ChakraTooltip label={t('dashboard.review.tooltip')} hasArrow closeOnClick={true} openOnFocus={false}>
                         <IconButton 
                           icon={<CheckCircleIcon />} 
                           colorScheme="brand" 
                           variant="ghost" 
                           isRound
                           size="lg"
                           onClick={() => onRecordReview(problem.id)}
                           _hover={{ bg: 'brand.100', color: 'brand.600', transform: 'scale(1.1)' }}
                         />
                      </ChakraTooltip>
                      <ChakraTooltip label={t('common.viewSolutions')} hasArrow closeOnClick={true} openOnFocus={false}>
                         <IconButton 
                           icon={<Icon as={FaBookOpen} />} 
                           variant="ghost"
                           color={problem.solutions?.length > 0 ? "yellow.500" : "gray.500"}
                           isRound
                           onClick={() => onOpenSolutions(problem.id)}
                         />
                      </ChakraTooltip>
                    </HStack>
                  </Flex>
                </Box>
              );
            })}
          </Stack>
        </Box>
    </Box>
  );
};

export default ReviewListCard;
