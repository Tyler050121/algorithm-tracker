import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalCloseButton,
  Flex,
  HStack,
  IconButton,
  Input,
  Link,
  Stack,
  Text,
  Textarea,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { DeleteIcon, ExternalLinkIcon, AddIcon, EditIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const emptyForm = { title: '', notes: '', link: '' };

const MarkdownRenderer = ({ content }) => {
  const syntaxTheme = useColorModeValue(oneLight, oneDark);
  const codeBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      className="markdown-body"
      sx={{
        'p': { mb: 2 },
        'ul, ol': { mb: 2, pl: 4 },
        'li': { mb: 1 },
        'h1, h2, h3, h4, h5, h6': { fontWeight: 'bold', mt: 4, mb: 2 },
        'blockquote': { borderLeft: '4px solid', borderColor: 'gray.300', pl: 4, color: 'gray.500', fontStyle: 'italic' },
        'a': { color: 'brand.500', textDecoration: 'underline' },
        'code': { bg: codeBg, px: 1, py: 0.5, borderRadius: 'sm', fontSize: '0.9em' },
        'pre': { p: 0, mb: 4, borderRadius: 'md', overflow: 'hidden' },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={syntaxTheme}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

const SplitEditor = ({ value, onChange, placeholder, ...props }) => {
  const previewBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Flex 
      border="1px solid" 
      borderColor={borderColor} 
      borderRadius="md" 
      overflow="hidden"
      {...props}
    >
      {/* Editor Pane */}
      <Box w="50%" h="full" borderRight="1px solid" borderColor={borderColor}>
        <Textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          h="full"
          p={4}
          border="none"
          borderRadius="0"
          resize="none"
          fontFamily="mono"
          fontSize="sm"
          _focus={{ boxShadow: 'none' }}
        />
      </Box>
      
      {/* Preview Pane */}
      <Box 
        w="50%" 
        h="full" 
        bg={previewBg} 
        overflowY="auto" 
        p={4}
        className="markdown-preview"
      >
        {value ? (
          <MarkdownRenderer content={value} />
        ) : (
          <Text color="gray.400" fontStyle="italic" fontSize="sm">
            Preview will appear here...
          </Text>
        )}
      </Box>
    </Flex>
  );
};

function SolutionDrawer({ problem, isOpen, onClose, onAddSolution, onUpdateSolution, onDeleteSolution }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [activeProblem, setActiveProblem] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // State to toggle add form when solutions exist
  const [editingSolution, setEditingSolution] = useState(null);
  const toast = useToast();

  // Hooks must be called before early return
  const solutionBg = useColorModeValue('gray.50', 'gray.700');
  const solutionBorder = useColorModeValue('gray.100', 'gray.600');
  const solutionTextColor = useColorModeValue('gray.800', 'gray.200');
  
  // Glassmorphism styles
  const modalContentBg = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(26, 32, 44, 0.85)');
  const modalBackdropFilter = 'blur(16px)';
  const modalBorder = useColorModeValue('1px solid rgba(255, 255, 255, 0.4)', '1px solid rgba(255, 255, 255, 0.1)');
  const modalShadow = useColorModeValue(
    '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
  );

  useEffect(() => {
    if (problem) {
      setActiveProblem(problem);
      // If no solutions, default to adding mode
      if (problem.solutions && problem.solutions.length === 0) {
        setIsAdding(true);
      } else {
        setIsAdding(false);
      }
      setEditingSolution(null);
    }
    if (isOpen) {
      setForm(emptyForm);
      setEditingSolution(null);
    }
  }, [isOpen, problem]);

  if (!activeProblem) {
    return null;
  }

  const problemTitle = (i18n.language === 'zh' ? activeProblem.title.zh : activeProblem.title.en) || activeProblem.title.en || activeProblem.name;
  const hasSolutions = activeProblem.solutions && activeProblem.solutions.length > 0;

  const handleSave = () => {
    if (!form.title.trim() && !form.notes.trim()) {
      toast({ title: t('solutions.addWarning'), status: 'warning', duration: 2000, isClosable: true });
      return;
    }

    if (editingSolution) {
      onUpdateSolution(activeProblem.id, editingSolution.id, {
        title: form.title.trim() || t('solutions.unnamed'),
        notes: form.notes.trim(),
        link: form.link.trim(),
      });
      toast({ title: t('solutions.updateSuccess', 'Solution updated'), status: 'success', duration: 1500, isClosable: true });
    } else {
      onAddSolution(activeProblem.id, {
        title: form.title.trim() || t('solutions.unnamed'),
        notes: form.notes.trim(),
        link: form.link.trim(),
      });
      toast({ title: t('solutions.addSuccess'), status: 'success', duration: 1500, isClosable: true });
    }
    
    setForm(emptyForm);
    setIsAdding(false);
    setEditingSolution(null);
  };

  const handleEdit = (solution) => {
    setForm({
      title: solution.title,
      notes: solution.notes,
      link: solution.link || '',
    });
    setEditingSolution(solution);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingSolution(null);
    setForm(emptyForm);
  };

  const statusText = t(`problems.status.${activeProblem.status}`, activeProblem.status);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="6xl" 
      isCentered 
      motionPreset="slideInBottom"
      returnFocusOnClose={false}
    >
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent 
        bg={modalContentBg} 
        backdropFilter={modalBackdropFilter} 
        borderRadius="2xl" 
        boxShadow={modalShadow}
        border={modalBorder}
        h="85vh"
        display="flex"
        flexDirection="column"
      >
        <ModalHeader borderBottomWidth="1px" py={4}>
          <Text fontSize="lg" fontWeight="bold">
            {t('solutions.header')} {problemTitle}
          </Text>
          <Text fontSize="sm" color="gray.500" fontWeight="normal">
            #{activeProblem.id} · {t('solutions.status', { status: statusText })}
          </Text>
          <ModalCloseButton />
        </ModalHeader>

        <ModalBody p={0} display="flex" flexDirection="column" overflow="hidden" position="relative">
          <AnimatePresence mode="wait">
            {(!hasSolutions || isAdding) ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <Flex direction="column" h="full" p={6} gap={4}>
                  <Flex gap={4}>
                    <Input
                      placeholder={t('solutions.titlePlaceholder')}
                      value={form.title}
                      onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                      fontWeight="bold"
                      flex={2}
                    />
                    <Input
                      placeholder={t('solutions.linkPlaceholder')}
                      value={form.link}
                      onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
                      flex={1}
                    />
                  </Flex>
                  
                  <Box flex="1" minH="0">
                    <SplitEditor 
                      value={form.notes}
                      onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                      placeholder={t('solutions.notesPlaceholder')}
                      h="full"
                    />
                  </Box>
                </Flex>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <Flex direction="column" h="full" p={6} overflow="hidden">
                  <Flex justify="space-between" align="center" mb={4} flexShrink={0}>
                    <Text fontWeight="semibold" fontSize="lg">
                      {t('solutions.saved')} ({activeProblem.solutions.length})
                    </Text>
                    <Button size="sm" leftIcon={<AddIcon />} colorScheme="brand" onClick={() => setIsAdding(true)}>
                      {t('solutions.addTitle')}
                    </Button>
                  </Flex>
                  
                  <Box flex="1" overflowY="auto" pr={2} pb={2}>
                    <Stack spacing={4}>
                      {activeProblem.solutions.map((solution) => (
                        <Box key={solution.id} p={5} boxShadow="sm" borderRadius="lg" bg={solutionBg} border="1px solid" borderColor={solutionBorder}>
                          <Flex justify="space-between" align="flex-start" mb={3}>
                            <Box>
                              <Text fontWeight="bold" fontSize="md">{solution.title}</Text>
                              <Badge mt={1} colorScheme="gray" fontSize="xs">
                                {t('solutions.createdAt', { date: solution.createdAt ?? '?' })}
                              {solution.updatedAt && ` · ${t('solutions.updatedAt', { date: solution.updatedAt })}`}
                              </Badge>
                            </Box>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label={t('solutions.editTooltip', 'Edit Solution')}
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => handleEdit(solution)}
                              />
                              <IconButton
                                aria-label={t('solutions.deleteTooltip')}
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => onDeleteSolution(activeProblem.id, solution.id)}
                              />
                            </HStack>
                          </Flex>
                          {solution.notes && (
                            <Box fontSize="sm" color={solutionTextColor} mt={2}>
                              <MarkdownRenderer content={solution.notes} />
                            </Box>
                          )}
                          {solution.link && (
                            <Link
                              href={solution.link}
                              isExternal
                              display="inline-flex"
                              alignItems="center"
                              gap={1}
                              mt={3}
                              color="brand.500"
                              fontSize="sm"
                              fontWeight="medium"
                            >
                              {t('solutions.viewExternal')}
                              <ExternalLinkIcon />
                            </Link>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Flex>
              </motion.div>
            )}
          </AnimatePresence>
        </ModalBody>

        {(!hasSolutions || isAdding) && (
          <ModalFooter borderTopWidth="1px" py={3}>
            {hasSolutions && (
              <Button variant="ghost" mr={3} onClick={handleCancel}>
                {t('newSolve.cancel')}
              </Button>
            )}
            <Button colorScheme="brand" onClick={handleSave}>
              {editingSolution ? t('solutions.updateButton', 'Update Solution') : t('solutions.addButton')}
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}

export default SolutionDrawer;
