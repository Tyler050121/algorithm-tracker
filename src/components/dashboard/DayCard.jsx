import React from 'react';
import {
  Badge,
  Flex,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const DayCard = ({ day, isToday }) => {
  const { t } = useTranslation();
  const hasTasks = day.count > 0;

  // Colors
  const defaultBg = useColorModeValue('white', 'gray.700');
  
  const redBg = useColorModeValue('red.50', 'rgba(254, 178, 178, 0.16)');
  const orangeBg = useColorModeValue('orange.50', 'rgba(251, 211, 141, 0.16)');
  const brandBg = useColorModeValue('brand.50', 'rgba(90, 103, 216, 0.16)'); 

  // Border Colors
  const defaultBorderColor = useColorModeValue('gray.200', 'gray.600');

  // Today's special styling
  const todayBg = useColorModeValue('white', 'gray.700');
  const todayBorderColor = useColorModeValue('brand.500', 'brand.400');
  const todayShadow = useColorModeValue('0 4px 12px rgba(90, 103, 216, 0.25)', '0 4px 12px rgba(90, 103, 216, 0.4)');

  let bg = defaultBg;
  let badgeScheme = 'gray';
  let color = 'inherit';
  let borderColor = defaultBorderColor;

  if (hasTasks) {
    if (day.count > 4) {
      bg = redBg;
      badgeScheme = 'red';
      color = 'red.600';
      borderColor = 'red.200';
    } else if (day.count > 2) {
      bg = orangeBg;
      badgeScheme = 'orange';
      color = 'orange.600';
      borderColor = 'orange.200';
    } else {
      bg = brandBg;
      badgeScheme = 'brand';
      color = 'brand.600';
      borderColor = 'brand.200';
    }
  }

  if (isToday) {
    bg = todayBg;
    borderColor = todayBorderColor;
  }

  return (
    <VStack
      bg={bg}
      boxShadow={isToday ? todayShadow : 'none'}
      borderWidth={isToday ? '2px' : '1px'}
      borderColor={borderColor}
      borderRadius="xl"
      py={2}
      px={2}
      spacing={2}
      align="center"
      position="relative"
      transition="all 0.3s ease"
      _hover={{ transform: 'translateY(-2px)', shadow: 'md', borderColor: isToday ? todayBorderColor : 'brand.400' }}
      role="group"
      cursor="default"
      h="100%"
      justify="space-between"
      opacity={!isToday && !hasTasks ? 0.7 : 1}
    >
      {isToday && (
        <Badge
          position="absolute"
          top="-3"
          colorScheme="brand"
          variant="solid"
          fontSize="0.6rem"
          borderRadius="full"
          px={2}
          py={0.5}
          boxShadow="sm"
          zIndex={1}
        >
          TODAY
        </Badge>
      )}
      
      <VStack spacing={1} align="center" mt={1}>
        <Text fontSize="10px" fontWeight="bold" textTransform="uppercase" color="gray.500" letterSpacing="wider">
          {day.weekday}
        </Text>
        
        <Text fontSize="xl" fontWeight="extrabold" lineHeight="1" color={isToday ? 'brand.500' : color}>
          {day.label}
        </Text>
      </VStack>

      <Flex h="20px" align="center" justify="center" w="full">
        <Badge 
          colorScheme={badgeScheme} 
          variant={hasTasks ? "subtle" : "outline"} 
          borderRadius="full" 
          px={2} 
          fontSize="xs" 
          textTransform={hasTasks ? "none" : "uppercase"}
          opacity={hasTasks ? 1 : 0.5}
        >
           {hasTasks ? `${day.count} ${t('dashboard.problems', 'Tasks')}` : 'Free'}
        </Badge>
      </Flex>
    </VStack>
  );
};

export default DayCard;
