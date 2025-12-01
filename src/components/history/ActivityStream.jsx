import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiCalendar } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import TimelineItem from './TimelineItem';

const ActivityStream = ({ 
  selectedDate, 
  selectedDayActivities, 
  handleChartOpen, 
  undoHistory 
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const scrollbarThumbBg = useColorModeValue('gray.200', 'gray.600');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const emptyStateBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  return (
    <Box 
      w={{ base: 'full', xl: '380px' }} 
      h={{ base: '500px', xl: 'full' }}
      flexShrink={0}
      bg={cardBg}
      boxShadow="sm"
      borderRadius="2xl"
      p={6}
      border="1px solid"
      borderColor={borderColor}
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
        <VStack align="start" spacing={1} mb={6} flexShrink={0}>
          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
            Activity Stream
          </Text>
          <Heading size="lg">
            {selectedDate?.date ? format(parseISO(selectedDate.date), 'MMM d') : 'Select a Date'}
          </Heading>
          <Text fontSize="sm" color="gray.500">
            {selectedDate?.date ? format(parseISO(selectedDate.date), 'EEEE, yyyy') : 'Click on the heatmap to view activities'}
          </Text>
        </VStack>
        
        <Box 
          flex={1} 
          overflowY="auto" 
          pr={selectedDayActivities.length > 0 ? 2 : 0}
          css={{
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { width: '6px' },
            '&::-webkit-scrollbar-thumb': { background: scrollbarThumbBg, borderRadius: '24px' },
          }}
        >
          {selectedDayActivities.length > 0 ? (
            <Box pt={2}>
              {selectedDayActivities.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  isLast={index === selectedDayActivities.length - 1}
                  onChartOpen={handleChartOpen}
                  onUndo={undoHistory}
                />
              ))}
            </Box>
          ) : (
            <Flex flex={1} align="center" justify="center" direction="column" color="gray.400" bg={emptyStateBg} borderRadius="xl" minH="200px" h="full">
              <Icon as={FiCalendar} boxSize={10} mb={3} opacity={0.4} />
              <Text fontSize="sm" fontWeight="medium">No activities on this day</Text>
            </Flex>
          )}
        </Box>
    </Box>
  );
};

export default ActivityStream;
