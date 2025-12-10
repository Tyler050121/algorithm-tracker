import React, { useState } from 'react';
import {
  Tabs,
  Flex,
  VStack,
  HStack,
  Input,
  TabList,
  Tab,
  Text,
  TabPanels,
  TabPanel,
  Box,
  Textarea,
  IconButton,
  useColorModeValue,
  Tooltip,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  SimpleGrid,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { AddIcon, SmallCloseIcon, LinkIcon } from '@chakra-ui/icons';
import { FaRegLightbulb, FaCode, FaFire, FaRegClock, FaDatabase } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { PROGRAMMING_LANGUAGES } from '../../../constants';
import TagSelector from './TagSelector';
import ResizableSplitPane from './ResizableSplitPane';
import MarkdownRenderer from './MarkdownRenderer';

const CodeAddButton = ({ onAdd, isMini, usedLanguages = [], ...props }) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSelect = (lang) => {
    onAdd(lang);
    onClose();
  };

  return (
    <Popover 
        isOpen={isOpen} 
        onOpen={onOpen} 
        onClose={onClose} 
        placement={isMini ? "bottom-start" : "bottom"}
        isLazy
    >
      <PopoverTrigger>
        {isMini ? (
            <IconButton
              icon={<AddIcon />}
              size="xs"
              variant="ghost"
              aria-label="Add code block"
              borderRadius="none"
              h="full"
              w="32px"
              {...props}
            />
        ) : (
            <Button
                leftIcon={<AddIcon />}
                colorScheme="brand"
                size="md"
                {...props}
            >
                {t('solutions.addCodeBlock', 'Add Code Block')}
            </Button>
        )}
      </PopoverTrigger>
      <PopoverContent w="auto" maxW="400px" _focus={{ boxShadow: 'none' }}>
        <PopoverBody p={3}>
          <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.500" textTransform="uppercase">
            {t('solutions.selectLanguage', 'Select Language')}
          </Text>
          <SimpleGrid columns={3} spacing={2}>
            {PROGRAMMING_LANGUAGES.map(lang => {
              const isDisabled = usedLanguages.includes(lang.value);
              return (
                <Button
                  key={lang.value}
                  isDisabled={isDisabled}
                  size="sm"
                  variant="ghost"
                  justifyContent="flex-start"
                  onClick={() => handleSelect(lang.value)}
                  fontSize="xs"
                  fontWeight="normal"
                  _hover={!isDisabled ? { bg: 'blue.50', color: 'blue.600' } : undefined}
                  opacity={isDisabled ? 0.4 : 1}
                  cursor={isDisabled ? 'not-allowed' : 'pointer'}
                >
                  {lang.label}
                </Button>
              );
            })}
          </SimpleGrid>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

const CodeTabItem = ({ language, isActive, onClick, onRemove }) => {
    const activeBg = useColorModeValue('white', 'gray.800'); 
    const inactiveBg = useColorModeValue('gray.50', 'gray.900');
    const activeColor = useColorModeValue('brand.500', 'brand.300');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.100', 'gray.700');

    const label = PROGRAMMING_LANGUAGES.find(l => l.value === language)?.label || language;

    return (
        <Flex
            align="center"
            px={4}
            py={1}
            bg={isActive ? activeBg : inactiveBg}
            borderTop="2px solid"
            borderTopColor={isActive ? activeColor : 'transparent'}
            borderRight="1px solid"
            borderRightColor={borderColor}
            cursor="pointer"
            onClick={onClick}
            minW="auto"
            h="32px"
            _hover={{ bg: isActive ? activeBg : hoverBg }}
            transition="all 0.2s"
            role="group"
            gap={3}
        >
            <Text 
                fontSize="xs" 
                fontWeight={isActive ? "bold" : "medium"} 
                color={isActive ? activeColor : "gray.500"}
            >
                {label}
            </Text>
            <SmallCloseIcon 
                boxSize={3} 
                color="gray.400" 
                opacity={isActive ? 1 : 0} 
                _groupHover={{ opacity: 1 }}
                _hover={{ color: 'red.500' }} 
                onClick={(e) => onRemove(e)}
            />
        </Flex>
    )
};


const SolutionEditor = ({ form, setForm }) => {
  const { t } = useTranslation();
  const [activeCodeTab, setActiveCodeTab] = useState(0);
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const editorBg = useColorModeValue('gray.50', 'gray.900');
  const syntaxTheme = useColorModeValue(oneLight, oneDark);

  const previewBg = useColorModeValue('gray.50', 'blackAlpha.200');
  
  // Hook values for map loop
  const tabHeaderBg = useColorModeValue('gray.50', 'gray.800');
  const activeColor = useColorModeValue('brand.500', 'brand.300');

  const handleAddCodeBlock = (language = 'cpp') => {
    const newCodes = [...(form.codes || []), { language, content: '', id: Date.now() }];
    setForm({ ...form, codes: newCodes });
    setActiveCodeTab(newCodes.length - 1);
  };

  const handleRemoveCodeBlock = (index, e) => {
    e.stopPropagation();
    const newCodes = form.codes.filter((_, i) => i !== index);
    setForm({ ...form, codes: newCodes });
    if (activeCodeTab >= newCodes.length) {
      setActiveCodeTab(Math.max(0, newCodes.length - 1));
    }
  };

  const hasCodes = form.codes && form.codes.length > 0;
  const usedLanguages = (form.codes || []).map(c => c.language);

  return (
    <Tabs variant="unstyled" size="sm" isLazy h="full" display="flex" flexDirection="column">
      <Flex direction="column" h="full" p={6}>
        {/* Top Section: Title & Tags */}
        <VStack align="stretch" spacing={4} mb={4}>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t('solutions.titlePlaceholder')}
            size="lg"
            fontWeight="bold"
            variant="flushed"
            _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
            mb={2}
          />
          <HStack spacing={4} align="center">
            <InputGroup size="sm" width="180px">
              <InputLeftElement pointerEvents="none" color="gray.400">
                <FaRegClock />
              </InputLeftElement>
              <Input
                value={form.timeComplexity || ''}
                onChange={(e) => setForm({ ...form, timeComplexity: e.target.value })}
                placeholder={t('solutions.timeComplexity', 'Time: O(N)')}
                variant="flushed"
                pl={8}
                fontSize="sm"
                _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
              />
            </InputGroup>
            
            <InputGroup size="sm" width="180px">
              <InputLeftElement pointerEvents="none" color="gray.400">
                <FaDatabase />
              </InputLeftElement>
              <Input
                value={form.spaceComplexity || ''}
                onChange={(e) => setForm({ ...form, spaceComplexity: e.target.value })}
                placeholder={t('solutions.spaceComplexity', 'Space: O(1)')}
                variant="flushed"
                pl={8}
                fontSize="sm"
                _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
              />
            </InputGroup>

            <InputGroup size="sm" flex={1}>
              <InputLeftElement pointerEvents="none" color="gray.400">
                <LinkIcon />
              </InputLeftElement>
              <Input
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder={t('solutions.linkPlaceholder')}
                variant="flushed"
                pl={8}
                fontSize="sm"
                color="gray.500"
                _focus={{ borderColor: 'blue.500', boxShadow: 'none', color: 'inherit' }}
              />
            </InputGroup>

            <Tooltip label={t('solutions.pin', 'Mark as Hot')}>
              <IconButton
                icon={<FaFire />}
                size="sm"
                colorScheme={form.pinned ? 'orange' : 'gray'}
                variant={form.pinned ? 'solid' : 'ghost'}
                onClick={() => setForm({ ...form, pinned: !form.pinned })}
                aria-label="Mark as Hot"
              />
            </Tooltip>
          </HStack>
          <Flex justify="space-between" align="center">
            <TagSelector selectedTags={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
            <TabList bg={useColorModeValue('gray.100', 'gray.700')} p={1} borderRadius="md">
              <Tab 
                _selected={{ bg: useColorModeValue('white', 'gray.600'), shadow: 'sm', color: activeColor, fontWeight: 'bold' }} 
                borderRadius="sm" 
                px={3} 
                color="gray.500"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <FaRegLightbulb />
                <Text>{t('solutions.thought', '思路')}</Text>
              </Tab>
              <Tab 
                _selected={{ bg: useColorModeValue('white', 'gray.600'), shadow: 'sm', color: activeColor, fontWeight: 'bold' }} 
                borderRadius="sm" 
                px={3}
                color="gray.500"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <FaCode />
                <Text>{t('solutions.code', '代码')}</Text>
              </Tab>
            </TabList>
          </Flex>
        </VStack>

        <TabPanels flex={1} overflow="hidden">
          {/* Notes Panel */}
          <TabPanel p={0} h="full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              <Box 
                h="full"
                bg={useColorModeValue('white', 'gray.800')} 
                borderRadius="xl" 
                boxShadow="sm" 
                border="1px solid" 
                borderColor={borderColor}
                overflow="hidden"
              >
                <ResizableSplitPane
                  left={
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder={t('solutions.notesPlaceholder')}
                      h="full"
                      p={6}
                      border="none"
                      resize="none"
                      _focus={{ boxShadow: 'none' }}
                      fontSize="md"
                      fontFamily="mono"
                      lineHeight="1.6"
                      bg="transparent"
                    />
                  }
                  right={
                    <Box h="full" overflowY="auto" p={8} bg={previewBg}>
                      {form.notes ? (
                        <MarkdownRenderer content={form.notes} />
                      ) : (
                        <Flex h="full" align="center" justify="center" color="gray.400">
                          <Text>{t('solutions.preview')}</Text>
                        </Flex>
                      )}
                    </Box>
                  }
                />
              </Box>
            </motion.div>
          </TabPanel>

          {/* Code Panel */}
          <TabPanel p={0} h="full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              <Box 
                h="full"
                bg={useColorModeValue('white', 'gray.800')} 
                borderRadius="xl" 
                boxShadow="sm" 
                border="1px solid" 
                borderColor={borderColor}
                overflow="hidden"
                display="flex"
                flexDirection="column"
              >
              {hasCodes && (
                <Flex bg={tabHeaderBg} borderBottom="1px solid" borderColor={borderColor} px={2} pt={0}>
                  <HStack spacing={0} overflowX="auto" align="end">
                    {form.codes.map((code, idx) => (
                      <CodeTabItem 
                        key={code.id}
                        language={code.language}
                        isActive={activeCodeTab === idx}
                        onClick={() => setActiveCodeTab(idx)}
                        onRemove={(e) => handleRemoveCodeBlock(idx, e)}
                      />
                    ))}
                    <CodeAddButton onAdd={handleAddCodeBlock} isMini usedLanguages={usedLanguages} />
                  </HStack>
                </Flex>
              )}
              
              <Box flex={1} overflow="hidden">
                {!hasCodes ? (
                  <Flex h="full" align="center" justify="center" direction="column" color="gray.500">
                    <Text mb={4}>{t('solutions.noCode', 'Click to add a code block')}</Text>
                    <CodeAddButton onAdd={handleAddCodeBlock} usedLanguages={usedLanguages} />
                  </Flex>
                ) : (
                <ResizableSplitPane
                  left={
                    <Flex direction="column" h="full">
                      <Textarea
                        value={form.codes?.[activeCodeTab]?.content || ''}
                        onChange={(e) => {
                          const newCodes = [...(form.codes || [])];
                          if (newCodes[activeCodeTab]) {
                            newCodes[activeCodeTab] = { ...newCodes[activeCodeTab], content: e.target.value };
                            setForm({ ...form, codes: newCodes });
                          }
                        }}
                        placeholder={t('solutions.codePlaceholder')}
                        h="full"
                        p={4}
                        border="none"
                        resize="none"
                        fontFamily="mono"
                        fontSize="sm"
                        _focus={{ boxShadow: 'none' }}
                      />
                    </Flex>
                  }
                  right={
                    <Box h="full" overflowY="auto" bg={editorBg}>
                      <SyntaxHighlighter
                        language={form.codes?.[activeCodeTab]?.language || 'cpp'}
                        style={syntaxTheme}
                        customStyle={{ margin: 0, minHeight: '100%', fontSize: '14px', padding: '1.5rem', background: 'transparent' }}
                        codeTagProps={{ style: { background: 'transparent' } }}
                        showLineNumbers
                      >
                        {form.codes?.[activeCodeTab]?.content || ''}
                      </SyntaxHighlighter>
                    </Box>
                  }
                />
                )}
              </Box>
            </Box>
            </motion.div>
          </TabPanel>
        </TabPanels>
      </Flex>
    </Tabs>
  );
};

export default SolutionEditor;
