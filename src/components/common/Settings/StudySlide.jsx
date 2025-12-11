import React from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const StudySlide = ({ studyPlans, currentPlanSlug, onSelectPlan }) => {
  const { t, i18n } = useTranslation();
  const planCardBg = useColorModeValue('gray.50', 'gray.700');
  const planCardSelectedBg = useColorModeValue('brand.50', 'brand.900');
  const planCardBorder = useColorModeValue('gray.200', 'gray.600');
  const planCardSelectedBorder = useColorModeValue('brand.500', 'brand.400');

  return (
    <SimpleGrid 
      columns={1} 
      spacing={3} 
    >
      {studyPlans.map((plan, idx) => {
        const isSelected = currentPlanSlug === plan.slug;
        return (
          <MotionBox
            key={plan.slug}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectPlan(plan.slug)}
            cursor="pointer"
            p={4}
            borderRadius="md"
            bg={isSelected ? planCardSelectedBg : planCardBg}
            borderWidth="1px"
            borderColor={isSelected ? planCardSelectedBorder : planCardBorder}
            _hover={{ borderColor: 'brand.400', transform: 'scale(1.01)', shadow: 'sm' }}
            position="relative"
            layout
          >
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" fontSize="md" color={isSelected ? 'brand.500' : 'inherit'}>
                  {t(`study_plans.${plan.slug}.name`, { lng: i18n.language })}
                </Text>
                <Text fontSize="sm" color="gray.500" noOfLines={2}>
                  {t(`study_plans.${plan.slug}.desc`, { lng: i18n.language })}
                </Text>
              </VStack>
              {isSelected && <Icon as={FiCheck} color="brand.500" boxSize={5} />}
            </HStack>
          </MotionBox>
        );
      })}
    </SimpleGrid>
  );
};

export default StudySlide;
