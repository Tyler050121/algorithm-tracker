import React from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Tag,
  Badge,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiBookOpen, FiClock, FiTarget } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const StudySlide = ({ studyPlans, currentPlanSlug, onSelectPlan }) => {
  const { t, i18n } = useTranslation();
  
  // 颜色和样式配置
  const cardBg = useColorModeValue('white', 'whiteAlpha.100');
  const cardBorder = useColorModeValue('gray.200', 'whiteAlpha.200');
  const activeBorder = 'brand.500';
  const activeBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const dividerColor = useColorModeValue('gray.100', 'whiteAlpha.100');
  const introBg = useColorModeValue('brand.50', `rgba(255,255,255,0.06)`);
  const introBorder = useColorModeValue('brand.400', 'brand.300');
  const introIconColor = useColorModeValue('brand.500', 'brand.300');

  return (
    <VStack align="stretch" spacing={6}>
       {/* 介绍性文字 */}
       <Box 
         p={4} 
         bg={introBg}
         borderRadius="xl" 
         borderLeft="4px solid" 
         borderColor={introBorder}
       >
          <HStack align="start">
           <Icon as={FiBookOpen} color={introIconColor} mt={1} />
              <VStack align="start" spacing={0}>
             <Text fontWeight="bold" fontSize="sm" color={useColorModeValue('brand.700', 'brand.200')}>
               {t('settings.study.introTitle', 'Select Your Study Plan')}
             </Text>
             <Text fontSize="xs" color={useColorModeValue('brand.600', 'brand.300')}>
               {t('settings.study.introDesc', 'Choose a plan that fits your current schedule. Switching plans will not lose your progress.')}
             </Text>
              </VStack>
          </HStack>
       </Box>

      <SimpleGrid 
        columns={[1, 1, 2]} // 在大屏幕上双列显示
        spacing={4} 
      >
        {studyPlans.map((plan, idx) => {
          const isSelected = currentPlanSlug === plan.slug;
          return (
            <MotionBox
              key={plan.slug}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSelectPlan(plan.slug)}
              cursor="pointer"
              p={5}
              borderRadius="2xl"
              bg={isSelected ? activeBg : cardBg}
              borderWidth="2px"
              borderColor={isSelected ? activeBorder : cardBorder}
              position="relative"
              whileHover={{ 
                  y: -4, 
                  boxShadow: 'lg',
                  borderColor: isSelected ? activeBorder : 'brand.300'
              }}
              layout
            >
              {isSelected && (
                <Box
                    position="absolute"
                    top={-3}
                    right={-3}
                    bg="brand.500"
                    color="white"
                    borderRadius="full"
                    width="28px"
                    height="28px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="md"
                    as={motion.div}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <Icon as={FiCheck} boxSize={4} strokeWidth={3} />
                </Box>
              )}

              <VStack align="start" spacing={3} h="full">
                <HStack justify="space-between" w="full">
                    <Badge 
                        colorScheme={isSelected ? 'brand' : 'gray'} 
                        variant={isSelected ? 'solid' : 'subtle'}
                        borderRadius="full"
                        px={2}
                    >
                        {plan.slug.toUpperCase()}
                    </Badge>
                    {/* 假数据展示：持续时间 */}
                    <HStack fontSize="xs" color="gray.500">
                        <Icon as={FiClock} />
                        <Text>{t('settings.study.selfPaced', 'Self-paced')}</Text>
                    </HStack>
                </HStack>

                <Box flex={1}>
                    <Text fontWeight="bold" fontSize="lg" mb={1} color={isSelected ? 'brand.500' : 'inherit'}>
                      {t(`study_plans.${plan.slug}.name`, { lng: i18n.language })}
                    </Text>
                    <Text fontSize="sm" color="gray.500" noOfLines={3} lineHeight="tall">
                      {t(`study_plans.${plan.slug}.desc`, { lng: i18n.language })}
                    </Text>
                </Box>
                
                {/* 装饰性元素 */}
                <HStack pt={2} borderTopWidth="1px" borderColor={dividerColor} w="full">
                    <Icon as={FiTarget} color="gray.400" size="sm" />
                    <Text fontSize="xs" color="gray.400">
                      {t('settings.study.focusPatterns', 'Focus on core patterns')}
                    </Text>
                </HStack>
              </VStack>
            </MotionBox>
          );
        })}
      </SimpleGrid>
    </VStack>
  );
};

export default StudySlide;
