import React from 'react';
import {
  Badge,
  Box,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { FaFire, FaSnowflake } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import SpotlightCard from '../common/SpotlightCard';

const GreetingCard = ({ streak, isFrozen, todayActivityCount, overdueCount }) => {
  const { t } = useTranslation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning', 'Good Morning');
    if (hour < 18) return t('dashboard.greeting.afternoon', 'Good Afternoon');
    return t('dashboard.greeting.evening', 'Good Evening');
  };

  // Determine Streak Visuals
  let streakIcon = FaFire;
  let streakColor = "orange.500";
  let streakGradient = "radial(orange.400, transparent 70%)";
  let streakTextGradient = "linear(to-r, orange.400, red.500)";
  let streakLabel = t('dashboard.welcome.streak', 'Streak');

  if (isFrozen) {
    streakIcon = FaSnowflake;
    streakColor = "cyan.400";
    streakGradient = "radial(cyan.400, transparent 70%)";
    streakTextGradient = "linear(to-r, cyan.400, blue.500)";
    streakLabel = t('dashboard.welcome.streakFrozen', 'Frozen');
  } else if (overdueCount > 0) {
    streakIcon = WarningIcon;
    streakColor = "red.500";
    streakGradient = "radial(red.400, transparent 70%)";
    streakTextGradient = "linear(to-r, red.500, red.600)";
  }

  return (
    <SpotlightCard 
      bg={bg} 
      p={6} 
      borderRadius="2xl" 
      boxShadow="sm" 
      borderColor={borderColor}
      h="100%"
    >
      {overdueCount > 0 && (
        <Badge 
          position="absolute" 
          top={4} 
          right={4} 
          colorScheme="red" 
          variant="solid" 
          borderRadius="full" 
          px={3} 
          py={1}
          fontSize="xs"
          zIndex={2}
        >
          ⚠️ {overdueCount} {t('dashboard.welcome.overdueTasks', 'Overdue Tasks')}
        </Badge>
      )}
      <VStack align="start" spacing={4} h="full" justify="center">
        <Box>
          <Heading size="md" fontWeight="bold">
            {getGreeting()}, <Text as="span" color="brand.500">User</Text>!
          </Heading>
          <Text color="gray.500" fontSize="sm">
            {t('dashboard.welcome.subtitle', 'Ready to solve some problems?')}
          </Text>
        </Box>

        <HStack spacing={6} w="full" align="center">
          <Box position="relative" mt={1}>
            {/* Fire/Ice Effect Glow */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="60px"
              h="60px"
              borderRadius="full"
              bgGradient={streakGradient}
              opacity={0.6}
              filter="blur(10px)"
              animation="pulse-glow 2s infinite"
              sx={{
                '@keyframes pulse-glow': {
                  '0%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.6 },
                  '50%': { transform: 'translate(-50%, -50%) scale(1.2)', opacity: 0.8 },
                  '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.6 },
                }
              }}
            />
            <Icon 
              as={streakIcon} 
              w={12} h={12} 
              color={streakColor} 
              position="relative"
              zIndex={1}
            />
          </Box>
          
          <VStack align="start" spacing={0}>
              <Text fontSize="4xl" fontWeight="900" lineHeight="1" bgGradient={streakTextGradient} bgClip="text">
                {streak}
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                {t('dashboard.stats.days')} {streakLabel}
              </Text>
          </VStack>

          <Box w="1px" h="40px" bg="gray.200" />

          <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                  {todayActivityCount}
              </Text>
              <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  {t('dashboard.welcome.activities', 'Activities')}
              </Text>
          </VStack>
        </HStack>
      </VStack>
    </SpotlightCard>
  );
};

export default GreetingCard;
