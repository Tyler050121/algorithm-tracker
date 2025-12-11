import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useColorMode,
  useColorModeValue,
  Box,
  Flex,
  HStack,
  Icon,
  VStack,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { FiSettings, FiBook, FiDatabase, FiCpu } from 'react-icons/fi';
import { useAppTheme } from '../../context/ThemeContext';

import GeneralSlide from './Settings/GeneralSlide';
import StudySlide from './Settings/StudySlide';
import DataSlide from './Settings/DataSlide';
import AISlide from './Settings/AISlide';

const CATEGORIES = [
  { id: 'general', icon: FiSettings, component: GeneralSlide, title: 'settings.general' },
  { id: 'study', icon: FiBook, component: StudySlide, title: 'settings.studyPlan.title' },
  { id: 'data', icon: FiDatabase, component: DataSlide, title: 'settings.dataManagement.title' },
  { id: 'ai', icon: FiCpu, component: AISlide, title: 'AI Settings' },
];

function SettingsModal({
  isOpen,
  onClose,
  onExport,
  onImport,
  onClear,
  studyPlans,
  currentPlanSlug,
  onSelectPlan,
}) {
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { colorScheme, changeColorScheme, schemes } = useAppTheme();
  
  const [activeTab, setActiveTab] = useState(0);
  const scrollContainerRef = useRef(null);
  const sectionRefs = useRef([]);
  const isClickScrolling = useRef(false);

  const modalBg = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(26, 32, 44, 0.95)');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const navHoverBg = useColorModeValue('gray.200', 'whiteAlpha.200');
  const headingColor = useColorModeValue('gray.700', 'gray.200');
  
  // Reset scroll when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab(0);
      // Wait for render/mount
      setTimeout(() => {
          if(scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      }, 0);
    }
  }, [isOpen]);

  const handleTabClick = (index) => {
    setActiveTab(index);
    isClickScrolling.current = true;
    
    const container = scrollContainerRef.current;
    const section = sectionRefs.current[index];
    
    if (container && section) {
        // Use getBoundingClientRect for accurate relative positioning
        const containerRect = container.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        
        // Calculate the target scroll position
        // currentScrollTop + (distance from section top to container top)
        const targetScrollTop = container.scrollTop + (sectionRect.top - containerRect.top);
        
        container.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
        });

        // Re-enable scroll spy after scrolling animation
        setTimeout(() => {
            isClickScrolling.current = false;
        }, 600);
    }
  };

  const handleScroll = () => {
      if (isClickScrolling.current) return;
      
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      
      let newActiveTab = activeTab;
      
      // Logic: If section top is within the viewport (or slightly above), it's active
      CATEGORIES.forEach((_, idx) => {
          const section = sectionRefs.current[idx];
          if (!section) return;
          
          const offsetTop = section.offsetTop;
          
          // Use a threshold (e.g., 100px from top)
          if (scrollTop >= offsetTop - 100) { 
              newActiveTab = idx;
          }
      });
      
      // Edge case: if at bottom, select last tab
      if (scrollTop + containerHeight >= container.scrollHeight - 20) {
          newActiveTab = CATEGORIES.length - 1;
      }

      if (newActiveTab !== activeTab) {
          setActiveTab(newActiveTab);
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl" motionPreset="scale" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent 
        borderRadius="2xl" 
        bg={modalBg}
        backdropFilter="blur(20px) saturate(180%)"
        boxShadow="2xl"
        borderWidth="1px"
        borderColor={borderColor}
        h="600px" 
        overflow="hidden"
      >
        <Flex h="full" direction="column">
            {/* Header / Nav */}
            <Flex 
                p={4} 
                borderBottom="1px" 
                borderColor={borderColor} 
                align="center"
                justify="center"
                bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
                position="relative"
                zIndex={10}
            >
                <HStack spacing={4}>
                    {CATEGORIES.map((cat, idx) => {
                        const isActive = activeTab === idx;
                        return (
                            <Box 
                                key={cat.id}
                                as="button"
                                onClick={() => handleTabClick(idx)}
                                w="44px"
                                h="44px"
                                borderRadius="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                bg={isActive ? 'brand.500' : 'transparent'}
                                color={isActive ? 'white' : 'gray.500'}
                                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                _hover={{ bg: isActive ? 'brand.600' : navHoverBg }}
                                boxShadow={isActive ? 'lg' : 'none'}
                                transform={isActive ? 'scale(1.1)' : 'scale(1)'}
                            >
                                <Icon as={cat.icon} boxSize={5} />
                            </Box>
                        )
                    })}
                </HStack>
                
                <Box position="absolute" right={4} top="50%" transform="translateY(-50%)">
                    <ModalCloseButton position="static" />
                </Box>
            </Flex>

            {/* Content Body */}
            <ModalBody 
                p={0} 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                css={{
                    scrollBehavior: 'smooth',
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { 
                        background: useColorModeValue('rgba(0,0,0,0.2)', 'rgba(255,255,255,0.2)'),
                        borderRadius: '4px'
                    },
                }}
            >
                 <VStack spacing={0} align="stretch" pb={10}>
                    {CATEGORIES.map((Category, idx) => (
                        <Box 
                            key={Category.id} 
                            ref={el => sectionRefs.current[idx] = el}
                            id={`settings-${Category.id}`}
                            p={6}
                            pt={8}
                            pb={0}
                        >
                            <HStack spacing={3} mb={6} align="center">
                                <Icon as={Category.icon} boxSize={6} color={headingColor} />
                                <Heading size="md" color={headingColor}>
                                    {t(Category.title, Category.title)}
                                </Heading>
                            </HStack>
                            
                            <Category.component 
                                // Pass all props (some might be unused by some components, but that's fine)
                                colorMode={colorMode}
                                toggleColorMode={toggleColorMode}
                                colorScheme={colorScheme}
                                changeColorScheme={changeColorScheme}
                                schemes={schemes}
                                studyPlans={studyPlans}
                                currentPlanSlug={currentPlanSlug}
                                onSelectPlan={onSelectPlan}
                                onExport={onExport}
                                onImport={onImport}
                                onClear={onClear}
                            />
                            
                            {idx < CATEGORIES.length - 1 && (
                                <Divider mt={8} borderColor={borderColor} />
                            )}
                        </Box>
                    ))}
                 </VStack>
            </ModalBody>
        </Flex>
      </ModalContent>
    </Modal>
  );
}

export default SettingsModal;
