import React from 'react';
import { Link, useLocation, useOutlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Flex,
  HStack,
  Text,
  IconButton,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsIcon } from '@chakra-ui/icons';
import { FaHome, FaListUl, FaChartPie, FaCode } from 'react-icons/fa';
import { useProblems } from '../context/ProblemContext';
import NewSolveModal from '../components/common/NewSolveModal';
import SettingsModal from '../components/common/SettingsModal';
import { MainLayoutContext } from '../context/MainLayoutContext';

const MotionBox = motion.create(Box);
const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(12px)' },
  enter: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -12, filter: 'blur(12px)' },
};
const pageTransition = {
  type: 'tween',
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
};

const TabLink = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const inactiveColor = useColorModeValue('gray.900', 'whiteAlpha.900'); // Default Black
  const hoverColor = useColorModeValue('brand.600', 'brand.200'); // Hover to brand
  const bgHighlight = useColorModeValue('rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.1)');
  const shadowHighlight = useColorModeValue(
    '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
  );
  const borderHighlight = useColorModeValue(
    '1px solid rgba(255, 255, 255, 0.4)',
    '1px solid rgba(255, 255, 255, 0.08)'
  );
  const backdropHighlight = useColorModeValue('blur(8px)', 'blur(8px)');

  return (
    <Link to={to} style={{ position: 'relative' }}>
      <HStack
        as={Box}
        px={6}
        py={2}
        position="relative"
        zIndex={1}
        spacing={2}
        color={isActive ? activeColor : inactiveColor}
        fontWeight="bold"
        fontSize="sm"
        transition="color 0.2s"
        _hover={{ color: hoverColor }}
      >
        {icon && <Box as={icon} />}
        <Text>{children}</Text>
      </HStack>
      {isActive && (
        <MotionBox
          layoutId="tab-highlight"
          position="absolute"
          inset={0}
          bg={bgHighlight}
          boxShadow={shadowHighlight}
          border={borderHighlight}
          backdropFilter={backdropHighlight}
          borderRadius="full"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
};

const MainLayout = () => {
  const location = useLocation();
  const currentOutlet = useOutlet();
  const { t } = useTranslation();
  const { problems, completeProblem, studyPlans, currentPlanSlug, changePlan, exportData, importData, clearData } = useProblems();
  
  const newSolveModal = useDisclosure();
  const settingsModal = useDisclosure();

  const barBg = useColorModeValue('rgba(255, 255, 255, 0.6)', 'rgba(23, 25, 35, 0.6)');
  const barBorder = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)');

  return (
    <MainLayoutContext.Provider value={{ onOpenNewSolve: newSolveModal.onOpen }}>
        <Box 
        bg={useColorModeValue('brand.50', 'gray.900')} 
        h="100vh" 
        display="flex" 
        flexDirection="column" 
        overflow="hidden"
        transition="background-color 0.3s ease"
        >
        {/* Floating TabBar */}
        <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={100}
            bg={barBg}
            backdropFilter="blur(20px)"
            boxShadow="sm"
            px={6}
            py={3}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            borderBottom="1px solid"
            borderColor={barBorder}
        >
            {/* Left: Brand */}
            <HStack spacing={2} cursor="pointer" as={Link} to="/">
                <Box 
                    as={FaCode} 
                    boxSize={5} 
                    color={useColorModeValue('brand.600', 'brand.200')} 
                />
                <Text 
                    fontWeight="bold" 
                    fontSize="md" 
                    fontFamily="mono"
                    letterSpacing="tighter"
                    color={useColorModeValue('gray.900', 'white')}
                >
                    Algo.
                </Text>
            </HStack>

            {/* Center: Tabs */}
            <HStack spacing={1}>
                <TabLink to="/" icon={FaHome}>{t('tabs.dashboard')}</TabLink>
                <TabLink to="/problems" icon={FaListUl}>{t('tabs.problems')}</TabLink>
                <TabLink to="/analysis" icon={FaChartPie}>{t('tabs.analysis')}</TabLink>
            </HStack>
            
            {/* Right: Settings */}
            <IconButton
                aria-label="Settings"
                icon={<SettingsIcon />}
                onClick={settingsModal.onOpen}
                variant="ghost"
                isRound
                size="sm"
                color={useColorModeValue('gray.900', 'whiteAlpha.900')}
                _hover={{ color: useColorModeValue('brand.600', 'brand.200'), bg: 'blackAlpha.50', transform: 'rotate(90deg)' }}
                transition="all 0.3s"
            />
        </Box>

        <Box w="100%" overflow="hidden" position="relative" flex="1" display="flex" pt="80px">
            <AnimatePresence mode="wait" initial={false}>
            <MotionBox
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                transition={pageTransition}
                w="100%"
                h="100%"
                style={{ willChange: 'transform, opacity, filter' }}
                flex="1"
                display="flex"
                flexDirection="column"
            >
                <Box w="100%" h="100%" px={{ base: 4, md: 8 }} pb={6} display="flex" flexDirection="column" overflow="hidden">
                {currentOutlet}
                </Box>
            </MotionBox>
            </AnimatePresence>
        </Box>

        <NewSolveModal
            isOpen={newSolveModal.isOpen}
            onClose={newSolveModal.onClose}
            problems={problems}
            onConfirm={(id) => completeProblem(id, 'new')}
        />

        <SettingsModal
            isOpen={settingsModal.isOpen}
            onClose={settingsModal.onClose}
            onExport={exportData}
            onImport={importData}
            onClear={clearData}
            studyPlans={studyPlans}
            currentPlanSlug={currentPlanSlug}
            onSelectPlan={changePlan}
        />
        </Box>
    </MainLayoutContext.Provider>
  );
};

export default MainLayout;
