import React, { useState, useRef } from 'react';
import {
  Flex,
  Box,
  VStack,
  Text,
  HStack,
  Button,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  Divider,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FaRegLightbulb, FaCode, FaThumbtack } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { PROGRAMMING_LANGUAGES } from '../../../constants';
import MarkdownRenderer from './MarkdownRenderer';
import { formatDate, getTagColor } from './utils';

const SolutionViewer = ({ solution, onNavigate }) => {
  console.log('SolutionViewer rendering solution:', solution);
  const { t } = useTranslation();
  const [activeCodeTab, setActiveCodeTab] = useState(0);
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const syntaxTheme = useColorModeValue(oneLight, oneDark);
  const tabActiveBg = useColorModeValue('white', 'gray.700');
  const tabHoverBg = useColorModeValue('gray.100', 'gray.600');
  const tabHeaderBg = useColorModeValue('gray.50', 'gray.800');
  const sectionBg = useColorModeValue('gray.50', 'whiteAlpha.50');
  const activeColor = useColorModeValue('brand.500', 'brand.300');
  
  const lastScrollTime = useRef(0);

  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 500) return; // Debounce 500ms

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 2; // 2px threshold
    const isTop = scrollTop === 0;

    if (e.deltaY > 0 && isBottom) {
      // Scrolling down at bottom -> Next
      onNavigate('next');
      lastScrollTime.current = now;
    } else if (e.deltaY < 0 && isTop) {
      // Scrolling up at top -> Prev
      onNavigate('prev');
      lastScrollTime.current = now;
    }
  };

  if (!solution) return null;

  return (
    <Flex direction="column" h="full">
      <Box flex={1} overflowY="auto" p={8} onWheel={handleWheel}>
        <AnimatePresence mode="wait">
          <motion.div
            key={solution.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Box maxW="4xl" mx="auto">
              <VStack align="start" spacing={6}>
                <Box w="full">
                  <Flex justify="space-between" align="center" mb={2}>
                    <HStack>
                      <Text fontSize="sm" color="gray.500">
                        {formatDate(solution.updatedAt || solution.createdAt)}
                      </Text>
                      {solution.pinned && (
                        <Icon as={FaThumbtack} color="red.500" boxSize={3} ml={2} />
                      )}
                    </HStack>
                    <HStack>
                      {solution.link && (
                        <Button 
                          as="a" 
                          href={solution.link} 
                          target="_blank" 
                          size="xs" 
                          rightIcon={<ExternalLinkIcon />} 
                          variant="link" 
                          colorScheme="brand"
                          mr={4}
                        >
                          {t('solutions.viewExternal')}
                        </Button>
                      )}
                    </HStack>
                  </Flex>
                  <Text fontSize="3xl" fontWeight="bold" mb={4}>
                    {solution.title}
                  </Text>
                  <Wrap spacing={2}>
                    {(solution.tags || []).map(tag => (
                      <WrapItem key={tag}>
                        <Tag size="md" variant="subtle" colorScheme={getTagColor(tag)} borderRadius="full">
                          <TagLabel>{t(`tags.${tag}`, tag)}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>

                <Divider />

                <Box w="full">
                  {solution.notes && (
                    <Box mb={6}>
                      <HStack mb={3} spacing={2}>
                        <Icon as={FaRegLightbulb} color="yellow.500" boxSize={5} />
                        <Text 
                          fontSize="sm" 
                          fontWeight="bold" 
                          color="gray.500" 
                          textTransform="uppercase" 
                          letterSpacing="wide"
                        >
                          {t('solutions.thought', '思路')}
                        </Text>
                      </HStack>
                      <Box 
                        p={5} 
                        bg={sectionBg} 
                        borderRadius="lg" 
                        border="1px solid" 
                        borderColor={borderColor}
                      >
                        <MarkdownRenderer content={solution.notes} />
                      </Box>
                    </Box>
                  )}

                  {(solution.codes || []).length > 0 && (
                    <Box>
                      <HStack mb={3} spacing={2}>
                        <Icon as={FaCode} color="blue.500" boxSize={5} />
                        <Text 
                          fontSize="sm" 
                          fontWeight="bold" 
                          color="gray.500" 
                          textTransform="uppercase" 
                          letterSpacing="wide"
                        >
                          {t('solutions.code', '代码')}
                        </Text>
                      </HStack>
                      <Box borderRadius="lg" overflow="hidden" border="1px solid" borderColor={borderColor} boxShadow="sm">
                        <Flex bg={tabHeaderBg} borderBottom="1px solid" borderColor={borderColor} px={2} pt={2}>
                          <HStack spacing={2} overflowX="auto" pb={0}>
                            {solution.codes.map((code, idx) => (
                              <Box
                                key={idx}
                                px={4}
                                py={2}
                                bg={activeCodeTab === idx ? tabActiveBg : 'transparent'}
                                borderTopRadius="md"
                                border="1px solid"
                                borderColor={activeCodeTab === idx ? borderColor : 'transparent'}
                                borderBottomColor={activeCodeTab === idx ? tabActiveBg : borderColor}
                                cursor="pointer"
                                onClick={() => setActiveCodeTab(idx)}
                                _hover={{ bg: activeCodeTab !== idx && tabHoverBg }}
                                position="relative"
                                top="1px"
                              >
                                <Text 
                                  fontSize="xs" 
                                  fontWeight={activeCodeTab === idx ? "bold" : "medium"}
                                  color={activeCodeTab === idx ? activeColor : "gray.500"}
                                  textAlign="center"
                                >
                                  {PROGRAMMING_LANGUAGES.find(l => l.value === code.language)?.label || code.language}
                                </Text>
                              </Box>
                            ))}
                          </HStack>
                        </Flex>
                        <Box>
                          <SyntaxHighlighter
                            language={solution.codes[activeCodeTab]?.language || 'cpp'}
                            style={syntaxTheme}
                            customStyle={{ margin: 0, fontSize: '14px', padding: '1.5rem' }}
                            showLineNumbers
                          >
                            {solution.codes[activeCodeTab]?.content || ''}
                          </SyntaxHighlighter>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              </VStack>
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Flex>
  );
};

export default SolutionViewer;
