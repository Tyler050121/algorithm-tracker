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
import './analysis.css';

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
      className="activity-stream-container"
      bg={cardBg}
      borderColor={borderColor}
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
          className="analysis-scroll-container"
          flex={1} 
          overflowY="auto" 
          pr={selectedDayActivities.length > 0 ? 2 : 0}
          css={{
            '&::-webkit-scrollbar-thumb': { background: scrollbarThumbBg },
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
            <Flex className="activity-stream-empty" color="gray.400" bg={emptyStateBg}>
              <Icon as={FiCalendar} boxSize={10} mb={3} opacity={0.4} />
              <Text fontSize="sm" fontWeight="medium">No activities on this day</Text>
            </Flex>
          )}
        </Box>
    </Box>
  );
};

export default ActivityStream;
