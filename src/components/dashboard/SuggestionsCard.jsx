import React, { useState, useRef, useEffect } from 'react';
import {
  Badge,
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
  ExternalLinkIcon,
  AddIcon,
  SunIcon,
} from '@chakra-ui/icons';
import { FaBookOpen } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import DifficultyBadge from '../common/DifficultyBadge';
import SpotlightCard from '../common/SpotlightCard';

const SuggestionsCard = ({ suggestions, onOpenSolutions, onRecordNew }) => {
  const { t, i18n } = useTranslation();
  const [suggestionLimit, setSuggestionLimit] = useState(3);
  const listRef = useRef(null);

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.100', 'gray.700');
  const subtleBg = useColorModeValue('gray.50', 'gray.700');
  const suggestionHoverBg = useColorModeValue('orange.50', 'whiteAlpha.100');

  useEffect(() => {
    const calculateLimit = () => {
      if (listRef.current) {
        const height = listRef.current.clientHeight;
        // Item height ~60px + 12px gap = 72px
        // Formula: N * 72 - 12 <= Height  =>  N <= (Height + 12) / 72
        const count = Math.floor((height + 12) / 72);
        setSuggestionLimit(Math.max(1, count));
      }
    };

    calculateLimit();
    window.addEventListener('resize', calculateLimit);
    return () => window.removeEventListener('resize', calculateLimit);
  }, []);

  return (
     <SpotlightCard display="flex" flexDirection="column" bg={cardBg} borderRadius="2xl" p={5} boxShadow="sm" borderColor={cardBorderColor} flex={{ base: 'none', xl: 1.5 }} minH="300px">
         <Flex justify="space-between" align="center" mb={4} flexShrink={0}>
            <HStack spacing={3}>
               <Flex p={1.5} bg="orange.50" color="orange.500" borderRadius="lg"><Icon as={SunIcon} boxSize={4} /></Flex>
               <Text fontWeight="bold" fontSize="md">{t('dashboard.suggestions.title')}</Text>
            </HStack>
            <Badge colorScheme="orange" variant="subtle" borderRadius="full" px={2}>Top {suggestionLimit}</Badge>
         </Flex>
         <Stack spacing={3} flex={1} justify="center" ref={listRef} overflow="hidden">
            {suggestions.slice(0, suggestionLimit).map((problem) => (
              <Flex 
                key={problem.id} 
                p={3} 
                borderRadius="xl" 
                bg={subtleBg} 
                align="center" 
                justify="space-between"
                _hover={{ bg: suggestionHoverBg }}
                transition="background 0.2s"
              >
                <HStack spacing={3} overflow="hidden" flex={1}>
                   <DifficultyBadge difficulty={problem.difficulty} />
                   <VStack align="start" spacing={0} overflow="hidden">
                      <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>{(i18n.language === 'zh' ? problem.title.zh : problem.title.en) || problem.title.en}</Text>
                      <Text fontSize="xs" color="gray.500">#{problem.id}</Text>
                   </VStack>
                </HStack>
                <HStack spacing={2}>
                  <ChakraTooltip label={t('dashboard.suggestions.openExternal')} hasArrow closeOnClick={true} openOnFocus={false}>
                    <IconButton 
                      icon={<ExternalLinkIcon />} 
                      size="xs" 
                      variant="ghost" 
                      color="gray.400" 
                      _hover={{ color: 'blue.500', bg: 'blue.50' }} 
                      aria-label="Open Link" 
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`https://leetcode.cn/problems/${problem.slug}/`, '_blank');
                        e.currentTarget.blur();
                      }}
                    />
                  </ChakraTooltip>
                  <ChakraTooltip label={t('common.viewSolutions')} hasArrow closeOnClick={true} openOnFocus={false}>
                    <IconButton 
                      icon={<Icon as={FaBookOpen} />} 
                      size="xs" 
                      variant="ghost"
                      color={problem.solutions?.length > 0 ? "yellow.500" : "gray.400"}
                      onClick={() => onOpenSolutions(problem.id)} 
                      aria-label="View Solutions"
                    />
                  </ChakraTooltip>
                  <ChakraTooltip label={t('dashboard.suggestions.record')} hasArrow closeOnClick={true} openOnFocus={false}>
                    <IconButton icon={<AddIcon />} size="xs" variant="solid" colorScheme="orange" borderRadius="md" onClick={() => onRecordNew(problem.id)} aria-label="Record New" />
                  </ChakraTooltip>
                </HStack>
              </Flex>
            ))}
            {suggestions.length === 0 && <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>{t('dashboard.suggestions.empty')}</Text>}
         </Stack>
     </SpotlightCard>
  );
};

export default SuggestionsCard;
