import {
  useColorMode,
  useColorModeValue,
  Box,
  Flex,
  HStack,
  Icon,
  VStack,
  Text,
  Heading,
  Container,
  Portal,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiSettings, FiBook, FiDatabase, FiCpu } from 'react-icons/fi';
import { useAppTheme } from '../../context/ThemeContext';
import CornerCloseButton from './CornerCloseButton';

import GeneralSlide from './Settings/GeneralSlide';
import StudySlide from './Settings/StudySlide';
import DataSlide from './Settings/DataSlide';
import AISlide from './Settings/AISlide';

// 定义设置类别配置 - 移除硬编码颜色，改用动态主题色
const CATEGORIES = [
  { id: 'general', icon: FiSettings, component: GeneralSlide, title: 'settings.general' },
  { id: 'study', icon: FiBook, component: StudySlide, title: 'settings.studyPlan.title' },
  { id: 'data', icon: FiDatabase, component: DataSlide, title: 'settings.dataManagement.title' },
  { id: 'ai', icon: FiCpu, component: AISlide, title: 'settings.ai.title' },
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
  const { t, i18n } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { colorScheme, changeColorScheme, schemes } = useAppTheme();
  
  const [activeTab, setActiveTab] = useState('general');
  const scrollRef = useRef(null);

  const contentKey = useMemo(() => {
    const lng = i18n?.resolvedLanguage ?? i18n?.language ?? 'unknown';
    return `${activeTab}-${lng}`;
  }, [activeTab, i18n?.resolvedLanguage, i18n?.language]);

  const handleClose = useCallback(() => {
    setActiveTab('general');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose]);

  // Keep the content scroller pinned to the top when switching tabs/language.
  // This prevents "jump to bottom" and header flicker at the bottom.
  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [isOpen, contentKey]);

  // 主题颜色配置
  const modalBg = useColorModeValue('rgba(255, 255, 255, 0.90)', 'rgba(23, 25, 35, 0.90)');
  const sidebarBg = useColorModeValue('gray.50', 'rgba(0, 0, 0, 0.2)');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  
  // 侧边栏选中样式 - 使用 Brand 主题色
  const activeBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const activeColor = 'brand.500'; // 始终使用品牌色文字
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.50');

  const sidebarFooterCardBg = useColorModeValue('white', 'whiteAlpha.100');
  const scrollbarThumbBg = useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.1)');

  // 获取当前活动组件
  const ActiveComponent = CATEGORIES.find(c => c.id === activeTab)?.component || GeneralSlide;
  const activeCategory = CATEGORIES.find(c => c.id === activeTab);
  
  // NOTE: 侧边栏高亮统一使用 brand，不再按 palette 为每个 tab 上色。

  if (!isOpen) return null;

  return (
    <Portal>
      <Box
        position="fixed"
        inset={0}
        zIndex={1400}
        onClick={handleClose}
      >
        <Box position="absolute" inset={0} bg="blackAlpha.600" backdropFilter="blur(8px)" />

        <Flex
          position="relative"
          zIndex={1401}
          w="full"
          h="full"
          align="center"
          justify="center"
          p={{ base: 3, md: 6 }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            borderRadius="3xl"
            bg={modalBg}
            backdropFilter="blur(24px) saturate(120%)" // 增强毛玻璃质感
            boxShadow="dark-lg"
            borderWidth="1px"
            borderColor={borderColor}
            h="750px"
            overflow="hidden"
            display="flex"
            flexDirection="row"
            w="full"
            maxW="1100px"
          >
        {/* 左侧侧边栏 */}
        <Box 
          w="260px" 
          bg={sidebarBg} 
          borderRight="1px solid" 
          borderColor={borderColor}
          display="flex"
          flexDirection="column"
          position="relative"
          zIndex={2}
        >
          <Box p={8} pb={6}>
              <Text 
                fontSize="2xl" 
                fontWeight="800" 
                bgGradient="linear(to-r, brand.400, brand.600)"
                bgClip="text"
                letterSpacing="-0.02em"
              >
                {t('settings.title', 'Settings')}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1} fontWeight="medium">
                {t('settings.sidebar.subtitle', 'Personalize your experience')}
              </Text>
          </Box>

          <VStack spacing={2} align="stretch" px={4}>
            {CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.id;
              const highlightColor = activeColor;
              
              return (
                <HStack
                  key={cat.id}
                  as="button"
                  w="full"
                  py={3.5}
                  px={4}
                  borderRadius="xl"
                  spacing={3}
                  onClick={() => setActiveTab(cat.id)}
                  bg={isActive ? activeBg : 'transparent'}
                  color={isActive ? highlightColor : inactiveColor}
                  transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{ 
                    bg: isActive ? activeBg : hoverBg,
                    transform: 'translateX(2px)'
                  }}
                  position="relative"
                  overflow="hidden"
                >
                  {/* 选中时的左侧指示条 */}
                  {isActive && (
                    <Box
                      position="absolute"
                      left={0}
                      top="15%"
                      bottom="15%"
                      w="3px"
                      bg={highlightColor}
                      borderTopRightRadius="full"
                      borderBottomRightRadius="full"
                    />
                  )}
                  <Icon as={cat.icon} boxSize={5} color={isActive ? highlightColor : undefined} />
                  <Text fontWeight={isActive ? "bold" : "medium"} fontSize="sm">
                    {t(cat.title, cat.title)}
                  </Text>
                </HStack>
              );
            })}
          </VStack>

          {/* 底部信息 */}
          <Box mt="auto" p={6}>
            <Box 
                p={4} 
                borderRadius="xl" 
              bg={sidebarFooterCardBg}
                borderWidth="1px"
                borderColor={borderColor}
                boxShadow="sm"
            >
                <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={1}>
                    Algorithm Tracker
                </Text>
                <Text fontSize="xs" color="gray.400">
                    Version 0.1.0 (Beta)
                </Text>
            </Box>
          </Box>
        </Box>

        {/* 右侧内容区域 */}
        <Flex direction="column" flex={1} position="relative" bg="transparent" overflow="hidden">
           {/* 顶部关闭按钮，稍微独立出来 */}
           <Flex justify="flex-end" p={4} position="absolute" right={0} top={0} zIndex={10}>
              <CornerCloseButton onClick={handleClose} ariaLabel={t('common.close', 'Close')} position="static" />
           </Flex>

           {/* 主内容滚动区 */}
           <Box 
             flex={1} 
             overflowY="auto" 
             ref={scrollRef}
             sx={{
               '&::-webkit-scrollbar': { width: '6px' },
               '&::-webkit-scrollbar-track': { background: 'transparent' },
               '&::-webkit-scrollbar-thumb': { 
                 background: scrollbarThumbBg,
                 borderRadius: '3px'
               },
             }}
           >
             <Container maxW="container.md" py={8} px={7}>
               {/* 标题区域 */}
               <Box mb={6} borderBottomWidth="1px" borderColor={borderColor} pb={4}>
                 <Heading 
                   size="lg" 
                   mb={2} 
                   fontWeight="800"
                   bgGradient="linear(to-br, gray.800, gray.500)"
                   _dark={{ bgGradient: "linear(to-br, white, gray.400)" }}
                   bgClip="text"
                 >
                   {t(activeCategory?.title)}
                 </Heading>
                 <Text color="gray.500" fontSize="md">
                   {t('settings.sectionSubtitle', {
                     section: t(activeCategory?.title),
                     defaultValue: `Customize your ${t(activeCategory?.title)} preferences and options.`,
                   })}
                 </Text>
               </Box>

               <ActiveComponent
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
             </Container>
           </Box>
        </Flex>
          </Box>
        </Flex>
      </Box>
    </Portal>
  );
}

export default SettingsModal;
