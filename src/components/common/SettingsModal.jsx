import {
  Modal,
  ModalContent,
  ModalOverlay,
  useColorMode,
  useColorModeValue,
  Box,
  Flex,
  HStack,
  Icon,
  VStack,
  Text,
  IconButton,
  Heading,
  Container,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { FiSettings, FiBook, FiDatabase, FiCpu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppTheme } from '../../context/ThemeContext';

import GeneralSlide from './Settings/GeneralSlide';
import StudySlide from './Settings/StudySlide';
import DataSlide from './Settings/DataSlide';
import AISlide from './Settings/AISlide';

// 定义设置类别配置 - 移除硬编码颜色，改用动态主题色
const CATEGORIES = [
  { id: 'general', icon: FiSettings, component: GeneralSlide, title: 'settings.general' },
  { id: 'study', icon: FiBook, component: StudySlide, title: 'settings.studyPlan.title' },
  { id: 'data', icon: FiDatabase, component: DataSlide, title: 'settings.dataManagement.title' },
  { id: 'ai', icon: FiCpu, component: AISlide, title: 'AI Settings' },
];

// 动画变量配置 - 优化 3D 效果
const contentVariants = {
  hidden: { 
    opacity: 0, 
    x: 40, 
    rotateY: -5, 
    scale: 0.98 
  },
  visible: { 
    opacity: 1, 
    x: 0, 
    rotateY: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 120,
      damping: 18,
      mass: 0.8
    }
  },
  exit: { 
    opacity: 0, 
    x: -40, 
    rotateY: 5, 
    scale: 0.98,
    transition: { duration: 0.2 } 
  }
};

const navItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i) => ({
    x: 0,
    opacity: 1,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
};

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
  
  const [activeTab, setActiveTab] = useState('general');

  // 主题颜色配置
  const modalBg = useColorModeValue('rgba(255, 255, 255, 0.90)', 'rgba(23, 25, 35, 0.90)');
  const sidebarBg = useColorModeValue('gray.50', 'rgba(0, 0, 0, 0.2)');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  
  // 侧边栏选中样式 - 使用 Brand 主题色
  const activeBg = useColorModeValue('brand.50', 'whiteAlpha.100');
  const activeColor = 'brand.500'; // 始终使用品牌色文字
  const activeBorderColor = 'brand.500';
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.50');

  // 获取当前活动组件
  const ActiveComponent = CATEGORIES.find(c => c.id === activeTab)?.component || GeneralSlide;
  const activeCategory = CATEGORIES.find(c => c.id === activeTab);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      isCentered 
      size="5xl" // 加大尺寸，给内容更多空间
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
      <ModalContent 
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
                Personalize your experience
              </Text>
          </Box>

          <VStack spacing={2} align="stretch" px={4}>
            {CATEGORIES.map((cat, idx) => {
              const isActive = activeTab === cat.id;
              return (
                <motion.div
                  key={cat.id}
                  custom={idx}
                  initial="hidden"
                  animate="visible"
                  variants={navItemVariants}
                >
                  <HStack
                    as="button"
                    w="full"
                    py={3.5}
                    px={4}
                    borderRadius="xl"
                    spacing={3}
                    onClick={() => setActiveTab(cat.id)}
                    bg={isActive ? activeBg : 'transparent'}
                    color={isActive ? activeColor : inactiveColor}
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
                        as={motion.div}
                        layoutId="activeIndicator"
                        position="absolute"
                        left={0}
                        top="15%"
                        bottom="15%"
                        w="3px"
                        bg={activeBorderColor}
                        borderTopRightRadius="full"
                        borderBottomRightRadius="full"
                      />
                    )}
                    <Icon as={cat.icon} boxSize={5} />
                    <Text fontWeight={isActive ? "bold" : "medium"} fontSize="sm">
                      {t(cat.title, cat.title)}
                    </Text>
                  </HStack>
                </motion.div>
              );
            })}
          </VStack>

          {/* 底部信息 */}
          <Box mt="auto" p={6}>
            <Box 
                p={4} 
                borderRadius="xl" 
                bg={useColorModeValue('white', 'whiteAlpha.100')} 
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
              <IconButton
                icon={<FiX />}
                variant="ghost"
                onClick={onClose}
                aria-label="Close"
                borderRadius="full"
                size="sm"
                color="gray.500"
                _hover={{ bg: 'blackAlpha.100', color: 'red.500', transform: 'rotate(90deg)' }}
              />
           </Flex>

           {/* 主内容滚动区 */}
           <Box 
             flex={1} 
             overflowY="auto" 
             sx={{
               perspective: '1200px', // 增强 3D 透视
               '&::-webkit-scrollbar': { width: '6px' },
               '&::-webkit-scrollbar-track': { background: 'transparent' },
               '&::-webkit-scrollbar-thumb': { 
                 background: useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.1)'),
                 borderRadius: '3px'
               },
             }}
           >
             <Container maxW="container.md" h="full" py={12} px={8}>
               <AnimatePresence mode="wait">
                 <motion.div
                   key={activeTab}
                   variants={contentVariants}
                   initial="hidden"
                   animate="visible"
                   exit="exit"
                   style={{ 
                     minHeight: '100%', 
                     transformStyle: 'preserve-3d',
                   }}
                 >
                   {/* 优化后的标题区域 */}
                   <Box mb={8} borderBottomWidth="1px" borderColor={borderColor} pb={4}>
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
                        Customize your {t(activeCategory?.title).toLowerCase()} preferences and options.
                      </Text>
                   </Box>
                   
                   {/* 内容容器 - 移除额外的背景色，让子组件自己决定或直接融入 */}
                   <Box>
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
                   </Box>
                 </motion.div>
               </AnimatePresence>
             </Container>
           </Box>
        </Flex>
      </ModalContent>
    </Modal>
  );
}

export default SettingsModal;
