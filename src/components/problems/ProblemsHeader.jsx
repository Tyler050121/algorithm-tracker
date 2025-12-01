import React from 'react';
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

const ProblemsHeader = ({ search, setSearch }) => {
  const { t } = useTranslation();
  const inputBg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" mb={4} gap={4} flexShrink={0}>
      <Box>
        <Text fontWeight="semibold" fontSize="lg">
          {t('problems.title')}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {t('problems.subtitle')}
        </Text>
      </Box>
      <InputGroup maxW={{ base: 'full', md: '320px' }}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder={t('problems.searchPlaceholder')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          bg={inputBg}
        />
      </InputGroup>
    </Flex>
  );
};

export default ProblemsHeader;
