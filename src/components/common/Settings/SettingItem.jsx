import React from 'react';
import {
  Flex,
  Box,
  Text,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionFlex = motion.create(Flex);

const SettingItem = ({ icon, title, description, action, index = 0 }) => {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.4)', 'rgba(45, 55, 72, 0.4)');
  const hoverBg = useColorModeValue('rgba(255, 255, 255, 0.6)', 'rgba(45, 55, 72, 0.6)');
  const iconBg = useColorModeValue('brand.50', 'whiteAlpha.100');

  return (
    <MotionFlex 
      align="center" 
      justify="space-between" 
      p={4} 
      bg={cardBg}
      boxShadow="sm"
      borderRadius="lg"
      _hover={{ boxShadow: 'md', bg: hoverBg }}
      sx={{ transition: 'all 0.3s ease' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      mb={3}
    >
      <HStack spacing={4}>
        <Flex
          align="center"
          justify="center"
          w={10}
          h={10}
          borderRadius="full"
          bg={iconBg}
          color="brand.500"
        >
          <Icon as={icon} boxSize={5} />
        </Flex>
        <Box>
          <Text fontWeight="bold" fontSize="sm">{title}</Text>
          {description && <Text fontSize="xs" color="gray.500">{description}</Text>}
        </Box>
      </HStack>
      <Box>{action}</Box>
    </MotionFlex>
  );
};

export default SettingItem;
