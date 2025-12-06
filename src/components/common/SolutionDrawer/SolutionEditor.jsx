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
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon, SmallCloseIcon } from '@chakra-ui/icons';
import { FaRegLightbulb, FaCode } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { PROGRAMMING_LANGUAGES } from '../../../constants';
import TagSelector from './TagSelector';
import ResizableSplitPane from './ResizableSplitPane';
import MarkdownRenderer from './MarkdownRenderer';

const SolutionEditor = ({ form, setForm }) => {
  const { t } = useTranslation();
  const [activeCodeTab, setActiveCodeTab] = useState(0);
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const editorBg = useColorModeValue('gray.50', 'gray.900');
  const syntaxTheme = useColorModeValue(oneLight, oneDark);
  const previewBg = useColorModeValue('gray.50', 'blackAlpha.200');
  
  // Hook values for map loop
  const tabActiveBg = useColorModeValue('white', 'gray.700');
  const tabHoverBg = useColorModeValue('gray.100', 'gray.600');
  const tabHeaderBg = useColorModeValue('gray.50', 'gray.800');
  const selectBg = useColorModeValue('white', 'gray.800');
  const activeColor = useColorModeValue('brand.500', 'brand.300');

  const handleAddCodeBlock = () => {
    const newCodes = [...(form.codes || []), { language: 'cpp', content: '', id: Date.now() }];
    setForm({ ...form, codes: newCodes });
    setActiveCodeTab(newCodes.length - 1);
  };

  const handleRemoveCodeBlock = (index, e) => {
    e.stopPropagation();
    if (!form.codes || form.codes.length <= 1) return;
    const newCodes = form.codes.filter((_, i) => i !== index);
    setForm({ ...form, codes: newCodes });
    setActiveCodeTab(Math.max(0, activeCodeTab - 1));
  };

  return (
    <Tabs variant="unstyled" size="sm" isLazy h="full" display="flex" flexDirection="column">
      <Flex direction="column" h="full" p={6}>
        {/* Top Section: Title & Tags */}
        <VStack align="stretch" spacing={4} mb={4}>
          <HStack spacing={4} align="flex-end">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t('solutions.titlePlaceholder')}
              size="lg"
              fontWeight="bold"
              variant="flushed"
              _focus={{ borderColor: 'blue.500', boxShadow: 'none' }}
              flex={1}
            />
            <Input
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder={t('solutions.linkPlaceholder')}
              size="md"
              variant="flushed"
              w="35%"
              fontSize="sm"
              color="gray.500"
              _focus={{ borderColor: 'blue.500', boxShadow: 'none', color: 'inherit' }}
            />
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
              <Flex bg={tabHeaderBg} borderBottom="1px solid" borderColor={borderColor} px={2} pt={2}>
                <HStack spacing={1} overflowX="auto" pb={0}>
                  {(form.codes || []).map((code, idx) => (
                    <Box
                      key={code.id}
                      px={3}
                      py={2}
                      bg={activeCodeTab === idx ? tabActiveBg : 'transparent'}
                      borderTopRadius="md"
                      border="1px solid"
                      borderColor={activeCodeTab === idx ? borderColor : 'transparent'}
                      borderBottomColor={activeCodeTab === idx ? tabActiveBg : borderColor}
                      cursor="pointer"
                      onClick={() => setActiveCodeTab(idx)}
                      position="relative"
                      top="1px"
                      minW="100px"
                      _hover={{ bg: activeCodeTab !== idx && tabHoverBg }}
                    >
                      <Flex align="center" justify="space-between">
                        <Text 
                          fontSize="xs" 
                          fontWeight="bold" 
                          mr={2}
                          color={activeCodeTab === idx ? activeColor : 'inherit'}
                        >
                          {PROGRAMMING_LANGUAGES.find(l => l.value === code.language)?.label || code.language}
                        </Text>
                        {(form.codes || []).length > 1 && (
                          <SmallCloseIcon 
                            boxSize={3} 
                            color="gray.400" 
                            _hover={{ color: 'red.500' }} 
                            onClick={(e) => handleRemoveCodeBlock(idx, e)}
                          />
                        )}
                      </Flex>
                    </Box>
                  ))}
                  <IconButton
                    icon={<AddIcon />}
                    size="xs"
                    variant="ghost"
                    onClick={handleAddCodeBlock}
                    aria-label="Add code block"
                    mb={1}
                  />
                </HStack>
              </Flex>
              
              <Box flex={1} overflow="hidden">
                <ResizableSplitPane
                  left={
                    <Flex direction="column" h="full">
                      <Box p={2} borderBottom="1px solid" borderColor={borderColor} bg={selectBg}>
                        <Select
                          size="sm"
                          width="150px"
                          value={form.codes?.[activeCodeTab]?.language}
                          onChange={(e) => {
                            const newCodes = [...(form.codes || [])];
                            if (newCodes[activeCodeTab]) {
                              newCodes[activeCodeTab] = { ...newCodes[activeCodeTab], language: e.target.value };
                              setForm({ ...form, codes: newCodes });
                            }
                          }}
                          borderRadius="md"
                        >
                          {PROGRAMMING_LANGUAGES.map(lang => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                          ))}
                        </Select>
                      </Box>
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
                        showLineNumbers
                      >
                        {form.codes?.[activeCodeTab]?.content || ''}
                      </SyntaxHighlighter>
                    </Box>
                  }
                />
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
