import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Button,
  HStack,
  Text,
  useToast,
  Box,
  Flex,
  IconButton,
  useColorModeValue,
  Tooltip,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { 
  AddIcon, 
  DeleteIcon, 
  EditIcon, 
  CheckIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  SmallCloseIcon, 
} from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

import SolutionEditor from './SolutionEditor';
import SolutionViewer from './SolutionViewer';
import { emptyForm } from './utils';

const LongPressButton = ({ onComplete, duration = 2000, children, ...props }) => {
  const [progress, setProgress] = useState(0);
  const requestRef = useRef();
  const startTimeRef = useRef();

  const animate = (time) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const deltaTime = time - startTimeRef.current;
    const newProgress = Math.min((deltaTime / duration) * 100, 100);
    
    setProgress(newProgress);

    if (deltaTime < duration) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      onComplete();
      reset(); 
    }
  };

  const reset = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    startTimeRef.current = null;
    setProgress(0);
  };

  const start = () => {
    requestRef.current = requestAnimationFrame(animate);
  };

  return (
    <Button
      position="relative"
      overflow="hidden"
      onMouseDown={start}
      onMouseUp={reset}
      onMouseLeave={reset}
      onTouchStart={start}
      onTouchEnd={reset}
      css={{
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'none'
      }}
      {...props}
    >
      {progress > 0 && (
        <>
            <Box position="absolute" inset={0} zIndex={0}>
              <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                <rect
                  x="1" y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="10" ry="10"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset={100 - progress}
                  style={{ filter: 'drop-shadow(0 0 2px white)' }}
                />
              </svg>
            </Box>
            <Box position="absolute" inset={0} bg="white" opacity={progress / 600} transition="none" />
        </>
      )}
      <Box position="relative" zIndex={1}>{children}</Box>
    </Button>
  );
};

function SolutionDrawer({ problem, isOpen, onClose, onAddSolution, onUpdateSolution, onDeleteSolution }) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const toast = useToast();

  // Alert Dialog States
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isUnsavedAlertOpen, setIsUnsavedAlertOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'close' or 'cancel'
  const cancelRef = useRef();

  // Theme & Styles
  const modalContentBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(22, 27, 34, 0.95)');
  const modalBackdropFilter = 'blur(10px)';
  const modalBorder = useColorModeValue('1px solid rgba(0, 0, 0, 0.1)', '1px solid rgba(255, 255, 255, 0.1)');
  const modalShadow = 'xl';
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const footerBg = useColorModeValue('gray.50', 'gray.900');
  const activeDotColor = useColorModeValue('brand.500', 'brand.300');
  const cancelHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100');
  const cancelActiveBg = useColorModeValue('gray.200', 'whiteAlpha.200');

  const solutions = useMemo(() => {
    if (!problem?.solutions) return [];
    return [...problem.solutions].sort((a, b) => {
      if (a.pinned === b.pinned) {
        return 0;
      }
      return a.pinned ? -1 : 1;
    });
  }, [problem]);

  const hasSolutions = solutions.length > 0;
  const currentSolution = solutions[activeIndex];
  const prevSolutionsLength = useRef(solutions.length);
  const lastEditedIdRef = useRef(null);

  // 当解决方案列表更新时（如保存后重新排序），保持选中最后编辑的解决方案
  useEffect(() => {
    if (lastEditedIdRef.current) {
      const idx = solutions.findIndex(s => s.id === lastEditedIdRef.current);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
      lastEditedIdRef.current = null;
    } else if (solutions.length > prevSolutionsLength.current) {
      // 如果是新增，选中最后一个（注意：如果是置顶的新增，可能不在最后，这里逻辑可能需要调整，
      // 但通常新增的不带置顶，或者上面的 lastEditedIdRef 会处理）
      // 实际上有了 lastEditedIdRef，这个逻辑可以简化，但为了兼容保留
      // 如果 sort 后新增的不在最后，这里可能会错，所以最好都用 id 追踪
    }
    prevSolutionsLength.current = solutions.length;
  }, [solutions]);

  useEffect(() => {
    if (isOpen) {
      // Only reset if it's a different problem or we are forcing a reset
      // But we handle that in the other effect with ref
    }
  }, [isOpen]);

  // Safe check for current solution
  useEffect(() => {
    if (!isEditing && hasSolutions && !currentSolution) {
      setActiveIndex(0);
    }
  }, [solutions, activeIndex, isEditing, hasSolutions, currentSolution]);

  const handleNavigate = (direction) => {
    if (isEditing || !hasSolutions) return;
    if (direction === 'next' && activeIndex < solutions.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else if (direction === 'prev' && activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  const handleCreate = useCallback(() => {
    setForm({ 
      ...emptyForm, 
      title: `${t('solutions.unnamed')} ${solutions.length + 1}`,
      codes: [{ language: 'cpp', content: '', id: Date.now() }],
      tags: []
    });
    setIsEditing(true);
  }, [solutions.length, t]);

  // Reset state only when opening a NEW problem
  const prevProblemId = useRef(problem?.id);
  useEffect(() => {
    if (isOpen) {
      if (problem?.id !== prevProblemId.current) {
        setIsEditing(false);
        setActiveIndex(0);
        prevProblemId.current = problem?.id;
      }
    }
  }, [isOpen, problem]);

  const handleEdit = () => {
    if (currentSolution) {
      setForm({
        ...currentSolution,
        tags: currentSolution.tags || [],
        codes: (currentSolution.codes && currentSolution.codes.length > 0) 
          ? JSON.parse(JSON.stringify(currentSolution.codes)) 
          : [{ language: 'cpp', content: '', id: Date.now() }]
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    console.log('handleSave called with form:', form);
    if (!form.title && !form.notes) {
      toast({ title: t('solutions.addWarning'), status: 'warning', duration: 2000 });
      return;
    }
    const now = new Date();
    const validCodes = (Array.isArray(form.codes) ? form.codes : []).filter(c => c.content && c.content.trim());
    const solutionData = {
      ...form,
      codes: validCodes, 
      tags: Array.isArray(form.tags) ? form.tags : [],
      id: form.id || now.getTime().toString(), // Ensure ID is string if generated here
      updatedAt: now.toISOString(),
      createdAt: form.createdAt || now.toISOString(),
    };

    console.log('Saving solutionData:', solutionData);

    // 记录最后编辑的ID，以便在列表更新后保持选中
    lastEditedIdRef.current = solutionData.id;

    if (form.id && solutions.find(s => s.id === form.id)) {
      onUpdateSolution(problem.id, form.id, solutionData);
      toast({ title: t('solutions.updateSuccess'), status: 'success', duration: 2000 });
    } else {
      onAddSolution(problem.id, solutionData);
      toast({ title: t('solutions.addSuccess'), status: 'success', duration: 2000 });
    }
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    setIsDeleteAlertOpen(false);
    if (!currentSolution) return;
    const solId = currentSolution.id;
    onDeleteSolution(problem.id, solId);
    if (solutions.length <= 1) {
      handleCreate(); 
    } else {
      setActiveIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleCloseRequest = () => {
    if (isEditing) {
      setPendingAction('close');
      setIsUnsavedAlertOpen(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setIsUnsavedAlertOpen(false);
    setIsEditing(false);
    if (pendingAction === 'close') {
      onClose();
    }
    setPendingAction(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={handleCloseRequest} 
        size="6xl" 
        isCentered 
        motionPreset="scale"
        returnFocusOnClose={false}
      >
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
        <ModalContent
          bg={modalContentBg}
          backdropFilter={modalBackdropFilter}
          border={modalBorder}
          boxShadow={modalShadow}
          borderRadius="2xl"
          h="90vh"
          overflow="hidden"
        >
          {/* Header */}
          <Flex 
            px={6} 
            py={4} 
            borderBottom="1px solid" 
            borderColor={borderColor} 
            align="center" 
            justify="space-between"
            bg={useColorModeValue('whiteAlpha.500', 'blackAlpha.500')}
          >
            <HStack spacing={4}>
              <Text fontWeight="bold" fontSize="lg" color={useColorModeValue('gray.700', 'gray.200')}>
                {isEditing 
                  ? (form.id ? t('solutions.editTooltip') : t('solutions.addTitle')) 
                  : `${t('solutions.header')} (${solutions.length})`
                }
              </Text>
              {!isEditing && currentSolution && (
                <HStack spacing={2}>
                  {/* Tags removed from header as requested */}
                </HStack>
              )}
            </HStack>
            
            <HStack spacing={3}>
              {isEditing ? (
                <>
                  <LongPressButton 
                    size="sm" 
                    variant="ghost" 
                    onComplete={handleCancelEdit}
                    duration={600}
                    _active={{ bg: cancelActiveBg }}
                    _hover={{ bg: cancelHoverBg }}
                  >
                    {t('common.cancel')} (Hold)
                  </LongPressButton>
                  <Button 
                    size="sm" 
                    colorScheme="green" 
                    leftIcon={<CheckIcon />} 
                    onClick={handleSave}
                    boxShadow="md"
                  >
                    {t('common.save')}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    leftIcon={<AddIcon />} 
                    onClick={handleCreate} 
                    colorScheme="blue" 
                    size="sm"
                    boxShadow="sm"
                  >
                    {t('solutions.addTitle')}
                  </Button>
                  
                  {hasSolutions && (
                    <>
                      <Button 
                        leftIcon={<EditIcon />} 
                        onClick={handleEdit} 
                        size="sm" 
                        colorScheme="gray"
                        variant="outline"
                        boxShadow="sm"
                      >
                        {t('common.edit')}
                      </Button>
                      <IconButton 
                        icon={<DeleteIcon />} 
                        onClick={handleDeleteClick} 
                        colorScheme="red" 
                        variant="ghost" 
                        size="sm"
                        aria-label="Delete" 
                      />
                    </>
                  )}
                  <Divider orientation="vertical" h="20px" mx={2} />
                  <IconButton icon={<SmallCloseIcon />} onClick={handleCloseRequest} variant="ghost" aria-label="Close" size="sm" />
                </>
              )}
            </HStack>
          </Flex>

          {/* Main Body */}
          <Flex flex={1} overflow="hidden" position="relative">
            {/* Content Area */}
            <Box flex={1} h="full" overflow="hidden">
              {isEditing ? (
                <Box h="full">
                  <SolutionEditor form={form} setForm={setForm} />
                </Box>
              ) : (
                <Box h="full">
                  {hasSolutions && currentSolution ? (
                    <SolutionViewer 
                      solution={currentSolution} 
                      onNavigate={handleNavigate}
                    />
                  ) : (
                    <Flex h="full" align="center" justify="center" direction="column" color="gray.500">
                      <Text fontSize="lg" mb={4}>{t('solutions.empty')}</Text>
                      <Button leftIcon={<AddIcon />} onClick={handleCreate} colorScheme="green">
                        {t('solutions.addTitle')}
                      </Button>
                    </Flex>
                  )}
                </Box>
              )}
            </Box>
          </Flex>

          {/* Footer Navigation */}
          {!isEditing && hasSolutions && (
            <Flex 
              py={3} 
              px={6} 
              borderTop="1px solid" 
              borderColor={borderColor} 
              bg={footerBg}
              align="center"
              justify="center"
            >
              <HStack spacing={4}>
                <IconButton
                  icon={<ChevronUpIcon transform="rotate(-90deg)" />}
                  onClick={() => setActiveIndex(prev => prev - 1)}
                  isDisabled={activeIndex === 0}
                  variant="ghost"
                  aria-label="Previous"
                  size="sm"
                  borderRadius="full"
                />
                <HStack spacing={2}>
                  {solutions.map((_, idx) => (
                    <Tooltip key={idx} label={solutions[idx].title}>
                      <Box
                        w={idx === activeIndex ? "8px" : "6px"}
                        h={idx === activeIndex ? "8px" : "6px"}
                        borderRadius="full"
                        bg={idx === activeIndex ? activeDotColor : "gray.300"}
                        cursor="pointer"
                        onClick={() => setActiveIndex(idx)}
                        transition="all 0.2s"
                        _hover={{ transform: 'scale(1.2)' }}
                      />
                    </Tooltip>
                  ))}
                </HStack>
                <IconButton
                  icon={<ChevronDownIcon transform="rotate(-90deg)" />}
                  onClick={() => setActiveIndex(prev => prev + 1)}
                  isDisabled={activeIndex === solutions.length - 1}
                  variant="ghost"
                  aria-label="Next"
                  size="sm"
                  borderRadius="full"
                />
              </HStack>
            </Flex>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('common.delete')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('solutions.deleteConfirm', 'Are you sure you want to delete this solution? This action cannot be undone.')}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)} variant="ghost">
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Unsaved Changes Alert */}
      <AlertDialog
        isOpen={isUnsavedAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsUnsavedAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('common.unsavedChanges', 'Unsaved Changes')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('common.unsavedChangesConfirm', 'You have unsaved changes. Are you sure you want to discard them?')}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsUnsavedAlertOpen(false)} variant="ghost">
                {t('common.continueEditing', 'Continue Editing')}
              </Button>
              <Button colorScheme="red" onClick={confirmClose} ml={3}>
                {t('common.discard', 'Discard')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default SolutionDrawer;
