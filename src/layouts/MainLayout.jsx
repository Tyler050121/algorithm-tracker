import React, { useState } from 'react';
import { Link, useLocation, useOutlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Button,
  Tag,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddIcon, SettingsIcon } from '@chakra-ui/icons';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useProblems } from '../context/ProblemContext';
import NewSolveModal from '../components/common/NewSolveModal';
import SettingsModal from '../components/common/SettingsModal';
import BorderBeam from '../components/common/BorderBeam';

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

const titleAnimation = keyframes`
  0% { transform: scale(1) rotate(-1deg); }
  50% { transform: scale(1.03) rotate(1deg); }
  100% { transform: scale(1) rotate(-1deg); }
`;

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Flex
      as={Link}
      to={to}
      position="relative"
      px={3}
      h="32px"
      justify="center"
      align="center"
      color={isActive ? 'inherit' : inactiveColor}
      fontWeight={isActive ? 'bold' : 'medium'}
      _hover={{ textDecoration: 'none', color: useColorModeValue('black', 'white') }}
      transition="color 0.3s ease"
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="underline"
          style={{
            position: 'absolute',
            bottom: '-2px',
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(to right, var(--chakra-colors-brand-400), var(--chakra-colors-brand-600))',
            borderRadius: '2px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </Flex>
  );
};

const MainLayout = () => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const location = useLocation();
  const currentOutlet = useOutlet();
  const { t } = useTranslation();
  const { activitySeries } = useDashboardStats();
  const { problems, completeProblem, studyPlans, currentPlanSlug, changePlan, exportData, importData, clearData } = useProblems();
  
  const newSolveModal = useDisclosure();
  const settingsModal = useDisclosure();

  const headerBg = useColorModeValue('white', 'gray.900');
  const buttonColor = useColorModeValue('brand.600', 'brand.200');
  const buttonBg = useColorModeValue('brand.50', 'whiteAlpha.200');

  // Calculate today's stats
  // Note: activitySeries is calculated in useDashboardStats, we can use the last item if it's today
  // Or recalculate here if needed. Let's recalculate for simplicity as activitySeries might not be exactly what we want for the header tags
  // Actually, let's just use activitySeries for now, assuming the last item is today.
  // Wait, activitySeries goes back 20 days. The last item should be today.
  const todayStats = activitySeries[activitySeries.length - 1] || { learned: 0, reviewed: 0 };

  return (
    <Box 
      bg={useColorModeValue('brand.50', 'gray.900')} 
      h="100vh" 
      display="flex" 
      flexDirection="column" 
      overflow="hidden"
      transition="background-color 0.3s ease"
    >
      <Box
        bg={headerBg}
        flexShrink={0}
        shadow="sm"
        // Removed borderBottom to make it cleaner as per plan
        // borderBottom="1px solid"
        // borderColor={border}
        px={{ base: 4, md: 8 }}
        transition="background-color 0.3s ease, border-color 0.3s ease"
      >
        <Flex direction="row" justify="space-between" align="center" h="72px">
          {/* Left Side */}
          <Box
            as={Link}
            to="/"
            animation={`${titleAnimation} 6s ease-in-out infinite`}
            _hover={{
              animationPlayState: 'paused',
              transform: 'scale(1.05) rotate(0deg)',
              textDecoration: 'none',
            }}
          >
            <Heading
              size="md"
              bgGradient="linear(to-r, brand.500, brand.300)"
              bgClip="text"
              fontWeight="extrabold"
            >
              {t('header.title')}
            </Heading>
          </Box>

          {/* Right Side */}
          <HStack spacing={6}>
            <HStack spacing={3}>
              <NavLink to="/">{t('tabs.dashboard')}</NavLink>
              <NavLink to="/problems">{t('tabs.problems')}</NavLink>
              <NavLink to="/history">{t('tabs.history')}</NavLink>
            </HStack>
            <HStack spacing={3}>
              <Tag size="sm" colorScheme="brand" variant="subtle">
                {t('header.newToday', { count: todayStats.learned })}
              </Tag>
              <Tag size="sm" colorScheme="accent" variant="subtle">
                {t('header.reviewToday', { count: todayStats.reviewed })}
              </Tag>
              <Button
                leftIcon={<AddIcon boxSize={3} />}
                colorScheme="brand"
                variant="solid"
                bg={buttonBg}
                color={buttonColor}
                borderRadius="full"
                position="relative"
                overflow="hidden"
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                _hover={{
                  bg: useColorModeValue('brand.100', 'whiteAlpha.300'),
                  transform: 'scale(1.05)',
                }}
                _active={{
                  transform: 'scale(0.95)',
                }}
                size="sm"
                onClick={newSolveModal.onOpen}
                transition="transform 0.1s ease-out"
              >
                <BorderBeam duration={8} borderWidth={1.5} isVisible={isButtonHovered} />
                {t('header.addNewSolve')}
              </Button>
              <IconButton
                aria-label="Settings"
                icon={<SettingsIcon />}
                onClick={settingsModal.onOpen}
                variant="ghost"
                size="sm"
                transition="transform 0.2s ease-in-out"
                _hover={{
                  transform: 'scale(1.1) rotate(90deg)',
                }}
                _active={{
                  transform: 'scale(0.9)',
                }}
              />
            </HStack>
          </HStack>
        </Flex>
      </Box>

      <Box w="100%" overflow="hidden" position="relative" flex="1" display="flex">
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
            <Box w="100%" h="100%" px={{ base: 4, md: 8 }} py={6} display="flex" flexDirection="column" overflow="hidden">
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
  );
};

export default MainLayout;
