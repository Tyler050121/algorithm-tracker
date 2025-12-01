import React from 'react';
import {
  Badge,
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  Tooltip as ChakraTooltip,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaTrophy } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const AchievementsCard = ({ achievements }) => {
  const { t } = useTranslation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const nextAchievement = achievements.find(a => !a.unlocked);

  return (
    <Box 
      bg={bg} 
      p={5} 
      borderRadius="2xl" 
      boxShadow="sm" 
      border="1px solid" 
      borderColor={borderColor}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      h="100%"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <HStack>
          <Icon as={FaTrophy} color="yellow.500" />
          <Text fontSize="sm" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
            {t('dashboard.achievements.title', 'Achievements')}
          </Text>
          <Badge colorScheme="gray" fontSize="xs" borderRadius="full">{unlockedCount}/{achievements.length}</Badge>
        </HStack>
        {nextAchievement && (
          <HStack spacing={1}>
              <Text fontSize="xs" color="gray.400">{t('dashboard.achievements.nextGoal', 'Next Goal')}:</Text>
              <Text fontSize="xs" color="brand.500" fontWeight="bold" noOfLines={1} maxW="100px">
                {nextAchievement.title}
              </Text>
          </HStack>
        )}
      </Flex>
      
      <Box position="relative" w="full" flex={1} overflow="hidden">
          <HStack 
            spacing={4} 
            overflowX="auto" 
            py={1} 
            px={1}
            h="full"
            align="center"
            css={{ 
                '&::-webkit-scrollbar': { height: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: '#E2E8F0', borderRadius: '2px' },
            }}
          >
            {achievements.map((achievement) => (
              <ChakraTooltip 
                key={achievement.id} 
                label={
                  <VStack align="start" spacing={0} p={1}>
                    <Text fontWeight="bold" fontSize="sm">{achievement.title}</Text>
                    <Text fontSize="xs">{achievement.desc}</Text>
                    {!achievement.unlocked && <Text fontSize="xs" color="red.300">Locked</Text>}
                  </VStack>
                } 
                hasArrow
                placement="top"
              >
                <Flex
                  minW={10} h={10}
                  borderRadius="xl"
                  bg={achievement.unlocked ? 'brand.50' : 'gray.100'}
                  color={achievement.unlocked ? 'brand.500' : 'gray.400'}
                  align="center" justify="center"
                  border="1px solid"
                  borderColor={achievement.unlocked ? 'brand.200' : 'transparent'}
                  opacity={achievement.unlocked ? 1 : 0.6}
                  filter={achievement.unlocked ? 'none' : 'grayscale(100%)'}
                  transition="all 0.2s"
                  _hover={{ transform: 'translateY(-2px)', borderColor: 'brand.300', shadow: 'sm' }}
                  cursor="default"
                  flexShrink={0}
                >
                  <Text fontSize="lg">{achievement.icon}</Text>
                </Flex>
              </ChakraTooltip>
            ))}
          </HStack>
      </Box>
    </Box>
  );
};

export default AchievementsCard;
