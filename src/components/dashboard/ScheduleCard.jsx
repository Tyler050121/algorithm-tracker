import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Icon,
  SimpleGrid,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { CalendarIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import DayCard from './DayCard';

const ScheduleCard = ({ schedule }) => {
  const { t } = useTranslation();
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box 
      bg={cardBg} 
      borderRadius="2xl" 
      p={4} 
      boxShadow="sm" 
      border="1px solid" 
      borderColor={cardBorderColor} 
      flexShrink={0} 
      h={{ base: 'auto', xl: '160px' }} 
      display="flex" 
      flexDirection="column" 
      justifyContent="center"
    >
       <HStack spacing={3} mb={2} flexShrink={0}>
          <Flex p={1.5} bg="purple.50" color="purple.500" borderRadius="lg">
            <Icon as={CalendarIcon} boxSize={4} />
          </Flex>
          <Text fontWeight="bold" fontSize="md">{t('dashboard.schedule.title')}</Text>
       </HStack>
       <SimpleGrid columns={7} spacing={2} flex={1}>
          {schedule.map((day, index) => (
            <DayCard key={day.iso} day={day} isToday={index === 0} />
          ))}
       </SimpleGrid>
    </Box>
  );
};

export default ScheduleCard;
