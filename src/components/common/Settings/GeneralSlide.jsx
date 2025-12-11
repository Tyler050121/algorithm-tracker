import React from 'react';
import {
  Button,
  HStack,
  Box,
  Icon,
  Tooltip,
  Flex,
  VStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiMoon, FiSun, FiGlobe, FiDroplet } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import SettingItem from './SettingItem';

const MotionFlex = motion.create(Flex);

const DarkModeSwitch = ({ isDark, toggle }) => {
  return (
    <Box
      as={motion.div}
      w="52px"
      h="28px"
      bg={isDark ? 'gray.700' : 'gray.100'}
      borderRadius="full"
      p="4px"
      cursor="pointer"
      onClick={toggle}
      display="flex"
      justifyContent={isDark ? 'flex-end' : 'flex-start'}
      alignItems="center"
      layout
      transition={{ type: "spring", stiffness: 700, damping: 30 }}
      boxShadow={isDark ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : 'inset 0 2px 4px rgba(0,0,0,0.05)'}
      borderWidth="1px"
      borderColor={isDark ? 'gray.600' : 'gray.200'}
    >
      <MotionFlex
        layout
        w="20px"
        h="20px"
        bg={isDark ? 'gray.800' : 'white'}
        borderRadius="full"
        align="center"
        justify="center"
        shadow="sm"
        whileTap={{ width: "24px" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? 'moon' : 'sun'}
            initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
             <Icon 
               as={isDark ? FiMoon : FiSun} 
               color={isDark ? 'yellow.400' : 'accent.400'} 
               boxSize={3} 
             />
          </motion.div>
        </AnimatePresence>
      </MotionFlex>
    </Box>
  );
};

const GeneralSlide = ({ 
  colorMode, 
  toggleColorMode, 
  colorScheme, 
  changeColorScheme, 
  schemes 
}) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (nextLanguage) => {
    i18n.changeLanguage(nextLanguage);
  };

  return (
    <VStack spacing={3} align="stretch">
      {/* 1. Dark Mode */}
      <SettingItem
        index={0}
        icon={colorMode === 'dark' ? FiMoon : FiSun}
        title={t('settings.darkMode')}
        description={t('settings.darkModeDesc') || "Switch between light and dark themes"}
        action={
          <DarkModeSwitch isDark={colorMode === 'dark'} toggle={toggleColorMode} />
        }
      />

      {/* 2. Language */}
      <SettingItem
        index={1}
        icon={FiGlobe}
        title={t('settings.language')}
        description={t('settings.languageDesc') || "Choose your preferred language"}
        action={
          <HStack spacing={2}>
            {['en', 'zh'].map((lang) => (
              <Button
                key={lang}
                size="sm"
                variant={i18n.language === lang ? 'solid' : 'outline'}
                colorScheme="brand"
                onClick={() => handleLanguageChange(lang)}
              >
                {lang === 'en' ? 'EN' : '中'}
              </Button>
            ))}
          </HStack>
        }
      />

      {/* 3. Theme Color */}
      <SettingItem
        index={2}
        icon={FiDroplet}
        title={t('settings.theme')}
        description={t('settings.themeDesc')}
        action={
          <HStack spacing={2}>
            {Object.entries(schemes).map(([key, scheme]) => (
              <Tooltip key={key} label={scheme.name} hasArrow>
                <Box
                  as="button"
                  w="24px"
                  h="24px"
                  borderRadius="full"
                  bg={scheme.colors.brand[500]}
                  onClick={() => changeColorScheme(key)}
                  boxShadow={colorScheme === key ? '0 0 0 2px white, 0 0 0 4px ' + scheme.colors.brand[500] : 'none'}
                  transition="all 0.2s"
                  _hover={{ transform: 'scale(1.1)' }}
                />
              </Tooltip>
            ))}
          </HStack>
        }
      />
    </VStack>
  );
};

export default GeneralSlide;
