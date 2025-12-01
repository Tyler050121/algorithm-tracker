import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

function StatCard({ icon, label, value, helpText }) {
  const bg = useColorModeValue('white', 'gray.800');
  const iconColor = useColorModeValue('brand.500', 'brand.300');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box 
      bg={bg} 
      p={5} 
      borderRadius="2xl" 
      boxShadow="sm" 
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
      border="1px solid"
      borderColor={borderColor}
    >
      <HStack spacing={4} align="start">
        <Flex 
          w={12} h={12} 
          align="center" justify="center" 
          borderRadius="xl" 
          bg={useColorModeValue('brand.50', 'whiteAlpha.100')}
          color={iconColor}
        >
          <Icon as={icon} boxSize={6} />
        </Flex>
        <VStack align="start" spacing={0}>
          <Text color={labelColor} fontSize="sm" fontWeight="medium">{label}</Text>
          <Text fontSize="2xl" fontWeight="bold" lineHeight="1.2">{value}</Text>
          {helpText && <Text fontSize="xs" color="gray.400">{helpText}</Text>}
        </VStack>
      </HStack>
    </Box>
  );
}

export default StatCard;
