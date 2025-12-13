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
  useToken,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ALGORITHM_TAGS } from '../../../constants';
import { getDeterministicPaletteToken, getReadableTextColor, hexToRgba } from '../../../theme/deriveThemeColors';

const TagSelector = ({ selectedTags = [], onChange }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const menuBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const selectedToneTokens = selectedTags.map((tag) =>
    getDeterministicPaletteToken(tag, { minIndex: 2, maxIndex: 7 })
  );
  const selectedToneHexes = useToken('colors', selectedToneTokens);

  const filteredTags = ALGORITHM_TAGS.filter(tag => 
    !selectedTags.includes(tag) && 
    (tag.toLowerCase().includes(search.toLowerCase()) || t(`tags.${tag}`).toLowerCase().includes(search.toLowerCase()))
  );

  const filteredToneTokens = filteredTags.map((tag) =>
    getDeterministicPaletteToken(tag, { minIndex: 2, maxIndex: 7 })
  );
  const filteredToneHexes = useToken('colors', filteredToneTokens);

  const tagBgAlpha = useColorModeValue(0.18, 0.22);

  return (
    <HStack spacing={2} wrap="wrap">
      <AnimatePresence>
        {selectedTags.map(tag => (
          (() => {
            const idx = selectedTags.indexOf(tag);
            const toneHex = selectedToneHexes[idx];
            const bg = hexToRgba(toneHex, tagBgAlpha);
            const border = hexToRgba(toneHex, tagBgAlpha + 0.08);
            const textColor = getReadableTextColor(toneHex, '#1A202C', '#FFFFFF');
            return (
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
              bg={bg}
              color={textColor}
              border="1px solid"
              borderColor={border}
              cursor="default"
            >
              <TagLabel>{t(`tags.${tag}`, tag)}</TagLabel>
              <TagCloseButton onClick={() => onChange(selectedTags.filter(t => t !== tag))} />
            </Tag>
          </motion.div>
            );
          })()
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
              (() => {
                const idx = filteredTags.indexOf(tag);
                const toneHex = filteredToneHexes[idx];
                const bg = hexToRgba(toneHex, tagBgAlpha);
                const border = hexToRgba(toneHex, tagBgAlpha + 0.08);
                const textColor = getReadableTextColor(toneHex, '#1A202C', '#FFFFFF');
                return (
              <MenuItem 
                key={tag} 
                onClick={() => { onChange([...selectedTags, tag]); setSearch(''); }}
                borderRadius="md"
                fontSize="sm"
              >
                <Badge bg={bg} color={textColor} border="1px solid" borderColor={border} px={2} borderRadius="full">
                  {t(`tags.${tag}`, tag)}
                </Badge>
              </MenuItem>
                );
              })()
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
