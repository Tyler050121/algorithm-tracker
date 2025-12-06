import React, { useState } from 'react';
import {
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Input,
  Box,
  Badge,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ALGORITHM_TAGS } from '../../../constants';
import { getTagColor } from './utils';

const TagSelector = ({ selectedTags = [], onChange }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const menuBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const filteredTags = ALGORITHM_TAGS.filter(tag => 
    !selectedTags.includes(tag) && 
    (tag.toLowerCase().includes(search.toLowerCase()) || t(`tags.${tag}`).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <HStack spacing={2} wrap="wrap">
      <AnimatePresence>
        {selectedTags.map(tag => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.1 }}
          >
            <Tag 
              size="md" 
              borderRadius="full" 
              variant="subtle" 
              colorScheme={getTagColor(tag)}
              cursor="default"
            >
              <TagLabel>{t(`tags.${tag}`, tag)}</TagLabel>
              <TagCloseButton onClick={() => onChange(selectedTags.filter(t => t !== tag))} />
            </Tag>
          </motion.div>
        ))}
      </AnimatePresence>
      <Menu closeOnSelect={false} placement="bottom-start" isLazy>
        <MenuButton
          as={Button}
          size="xs"
          variant="outline"
          borderRadius="full"
          leftIcon={<AddIcon />}
          colorScheme="gray"
          fontWeight="normal"
        >
          {t('solutions.addTag', 'Add')}
        </MenuButton>
        <MenuList 
          zIndex={1500} 
          maxH="300px" 
          overflowY="hidden" 
          display="flex" 
          flexDirection="column"
          p={2}
          bg={menuBg}
          borderColor={borderColor}
          boxShadow="xl"
        >
          <Input
            size="sm"
            placeholder={t('solutions.searchTags', 'Search...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            mb={2}
            borderRadius="md"
            autoFocus
          />
          <Box overflowY="auto" flex={1}>
            {filteredTags.map(tag => (
              <MenuItem 
                key={tag} 
                onClick={() => { onChange([...selectedTags, tag]); setSearch(''); }}
                borderRadius="md"
                fontSize="sm"
              >
                <Badge colorScheme={getTagColor(tag)} variant="subtle" px={2} borderRadius="full">
                  {t(`tags.${tag}`, tag)}
                </Badge>
              </MenuItem>
            ))}
            {filteredTags.length === 0 && (
              <Text fontSize="xs" color="gray.500" textAlign="center" py={2}>
                {t('solutions.noTagsFound', 'No tags found')}
              </Text>
            )}
          </Box>
        </MenuList>
      </Menu>
    </HStack>
  );
};

export default TagSelector;
