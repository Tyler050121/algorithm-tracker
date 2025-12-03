import React from 'react';
import {
  Badge,
  Box,
  Flex,
  HStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import SpotlightCard from '../common/SpotlightCard';

const DifficultyDistributionCard = ({ difficultyStats }) => {
  const { t } = useTranslation();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.100', 'gray.700');
  const diffHoverBg = useColorModeValue('gray.50', 'gray.700');
  const diffProgressBg = useColorModeValue('gray.100', 'gray.600');
  const diffPopoverBg = useColorModeValue('white', 'gray.700');
  const diffPopoverBorder = useColorModeValue('gray.100', 'gray.600');

  return (
     <SpotlightCard flex={1} bg={cardBg} borderRadius="2xl" px={4} py={3} boxShadow="sm" borderColor={cardBorderColor} display="flex" flexDirection="column">
         <Flex justify="space-between" align="center" mb={3} flexShrink={0}>
           <Text fontWeight="bold" fontSize="xs" color="gray.500">{t('dashboard.charts.difficulty', 'Difficulty')}</Text>
           <HStack spacing={2} fontSize="9px">
             <HStack spacing={1}>
               <Box w="6px" h="6px" borderRadius="sm" bg="green.500" />
               <Text color="gray.500">{t('dashboard.status.mastered', 'Mastered')}</Text>
             </HStack>
             <HStack spacing={1}>
               <Box w="6px" h="6px" borderRadius="sm" bg="green.200" />
               <Text color="gray.500">{t('dashboard.status.learning', 'Learning')}</Text>
             </HStack>
           </HStack>
         </Flex>
         <VStack spacing={1.5} align="stretch" flex={1} justify="center">
            {difficultyStats.map((item) => (
              <Popover key={item.name} trigger="hover" placement="top" isLazy closeOnBlur={true}>
                <PopoverTrigger>
                  <HStack 
                    spacing={1} 
                    fontSize="xs" 
                    cursor="pointer" 
                    py={0.5}
                    px={1} 
                    mx={-1} 
                    borderRadius="md"
                    transition="all 0.2s"
                    _hover={{ bg: diffHoverBg, transform: 'scale(1.01)' }}
                    justify="center"
                  >
                    <Text w="45px" fontWeight="semibold" fontSize="10px" color={item.color} isTruncated flexShrink={0}>{t(`dashboard.difficulty.${item.name.toLowerCase()}`, item.name)}</Text>
                    <Box flex={1} h="12px" bg={diffProgressBg} borderRadius="full" overflow="hidden" position="relative">
                      {/* Mastered portion - solid color */}
                      <Box 
                        position="absolute"
                        left={0}
                        h="100%" 
                        w={`${item.masteredPercent}%`} 
                        bg={item.color} 
                        borderRadius="full"
                        transition="width 0.5s ease"
                        zIndex={2}
                      />
                      {/* Learning portion - lighter color */}
                      <Box 
                        position="absolute"
                        left={0}
                        h="100%" 
                        w={`${item.masteredPercent + item.learningPercent}%`} 
                        bg={item.lightColor} 
                        borderRadius="full"
                        transition="width 0.5s ease"
                        zIndex={1}
                      />
                    </Box>
                    <Text w="auto" minW="35px" textAlign="right" fontWeight="bold" fontSize="9px" flexShrink={0}>
                      <Text as="span" color={item.color}>{item.done}</Text>
                      <Text as="span" color="gray.400">/{item.total}</Text>
                    </Text>
                  </HStack>
                </PopoverTrigger>
                <PopoverContent w="auto" minW="150px" bg={diffPopoverBg} borderRadius="xl" boxShadow="lg" border="1px solid" borderColor={diffPopoverBorder}>
                  <PopoverArrow bg={diffPopoverBg} />
                  <PopoverBody p={3}>
                    <VStack align="start" spacing={1.5}>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm" fontWeight="bold" color={item.color}>
                          {t(`dashboard.difficulty.${item.name.toLowerCase()}`, item.name)}
                        </Text>
                        <Badge colorScheme={item.name === 'Easy' ? 'green' : item.name === 'Medium' ? 'orange' : 'red'} fontSize="xs">
                          {item.percent}%
                        </Badge>
                      </HStack>
                      <Box w="full" h="1px" bg={diffPopoverBorder} />
                      <HStack justify="space-between" w="full" fontSize="xs">
                        <HStack spacing={1}>
                          <Box w="8px" h="8px" borderRadius="full" bg={item.color} />
                          <Text color="gray.500">{t('dashboard.status.mastered', 'Mastered')}</Text>
                        </HStack>
                        <Text fontWeight="bold">{item.mastered}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full" fontSize="xs">
                        <HStack spacing={1}>
                          <Box w="8px" h="8px" borderRadius="full" bg={item.lightColor} />
                          <Text color="gray.500">{t('dashboard.status.learning', 'Learning')}</Text>
                        </HStack>
                        <Text fontWeight="bold">{item.learning}</Text>
                      </HStack>
                      <HStack justify="space-between" w="full" fontSize="xs">
                        <HStack spacing={1}>
                          <Box w="8px" h="8px" borderRadius="full" bg="gray.300" />
                          <Text color="gray.500">{t('dashboard.status.unstarted', 'Unstarted')}</Text>
                        </HStack>
                        <Text fontWeight="bold">{item.total - item.done}</Text>
                      </HStack>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            ))}
         </VStack>
     </SpotlightCard>
  );
};

export default DifficultyDistributionCard;
