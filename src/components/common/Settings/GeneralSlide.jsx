import React from 'react';
import {
  Button,
  HStack,
  Box,
  Icon,
  Tooltip,
  Flex,
  VStack,
  Text,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiMoon, FiSun, FiGlobe, FiDroplet } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion.create(Box);

// 自定义开关组件
const DarkModeSwitch = ({ isDark, toggle }) => {
  return (
    <Box
      as={motion.div}
      w="60px"
      h="34px"
      bg={isDark ? 'gray.700' : 'gray.200'}
      borderRadius="full"
      p="4px"
      cursor="pointer"
      onClick={toggle}
      display="flex"
      justifyContent={isDark ? 'flex-end' : 'flex-start'}
      alignItems="center"
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      boxShadow="inner"
    >
      <motion.div
        layout
        style={{
          width: '26px',
          height: '26px',
          backgroundColor: isDark ? '#2D3748' : '#FFFFFF',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        <Icon 
          as={isDark ? FiMoon : FiSun} 
          color={isDark ? 'yellow.400' : 'orange.400'} 
          boxSize={3.5} 
        />
      </motion.div>
    </Box>
  );
};

// 统一样式的设置卡片
const SettingCard = ({ icon, title, description, action, delay = 0 }) => {
  const bg = useColorModeValue('white', 'whiteAlpha.100');
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.100');
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      p={5}
      bg={bg}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
      sx={{ transition: 'all 0.3s ease' }}
    >
      <Flex justify="space-between" align="center">
        <HStack spacing={4}>
          <Flex
            align="center"
            justify="center"
            w={12}
            h={12}
            borderRadius="xl"
            bg={useColorModeValue('brand.50', 'whiteAlpha.200')}
            color="brand.500"
          >
            <Icon as={icon} boxSize={6} />
          </Flex>
          <Box>
            <Text fontWeight="bold" fontSize="md">{title}</Text>
            {description && <Text fontSize="sm" color="gray.500">{description}</Text>}
          </Box>
        </HStack>
        <Box>{action}</Box>
      </Flex>
    </MotionBox>
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
  
  const langActiveColor = useColorModeValue('brand.600', 'white');
  const langHighlightBg = useColorModeValue('white', 'brand.500');
  const themeCardBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  const handleLanguageChange = (nextLanguage) => {
    i18n.changeLanguage(nextLanguage);
  };

  return (
    <VStack spacing={4} align="stretch">
      <SettingCard
        delay={0.1}
        icon={colorMode === 'dark' ? FiMoon : FiSun}
        title={t('settings.darkMode')}
        description={t('settings.darkModeDesc') || "Switch between light and dark themes"}
        action={
          <DarkModeSwitch isDark={colorMode === 'dark'} toggle={toggleColorMode} />
        }
      />

      <SettingCard
        delay={0.2}
        icon={FiGlobe}
        title={t('settings.language')}
        description={t('settings.languageDesc') || "Choose your preferred language"}
        action={
          <HStack spacing={0} bg={useColorModeValue('gray.100', 'whiteAlpha.200')} p={1} borderRadius="lg">
            {['en', 'zh'].map((lang) => {
              const isActive = i18n.language === lang;
              return (
                <Box
                  key={lang}
                  as="button"
                  onClick={() => handleLanguageChange(lang)}
                  py={1.5}
                  px={4}
                  borderRadius="md"
                  position="relative"
                  fontSize="sm"
                  fontWeight="bold"
                  color={isActive ? langActiveColor : 'gray.500'}
                  transition="color 0.2s"
                  _hover={{ color: isActive ? undefined : 'gray.600' }}
                >
                  {isActive && (
                    <Box
                      as={motion.div}
                      layoutId="langHighlight"
                      position="absolute"
                      inset={0}
                      bg={langHighlightBg}
                      borderRadius="md"
                      boxShadow="sm"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Text position="relative" zIndex={1}>
                    {lang === 'en' ? 'English' : '中文'}
                  </Text>
                </Box>
              );
            })}
          </HStack>
        }
      />

      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        p={6}
        bg={useColorModeValue('white', 'whiteAlpha.100')}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor={useColorModeValue('gray.100', 'whiteAlpha.100')}
        boxShadow="sm"
      >
        <HStack spacing={4} mb={4}>
             <Flex
                align="center"
                justify="center"
                w={12}
                h={12}
                borderRadius="xl"
                bg={useColorModeValue('brand.50', 'whiteAlpha.200')}
                color="brand.500"
              >
                <Icon as={FiDroplet} boxSize={6} />
              </Flex>
            <Box>
                <Text fontWeight="bold" fontSize="md">{t('settings.theme')}</Text>
                <Text fontSize="sm" color="gray.500">{t('settings.themeDesc')}</Text>
            </Box>
        </HStack>
        
        <SimpleGrid columns={[1, 2]} spacing={4}>
            {Object.entries(schemes).map(([key, scheme]) => (
              <Box
                key={key}
                as="button"
                onClick={() => changeColorScheme(key)}
                borderRadius="xl"
                borderWidth="2px"
                borderColor={colorScheme === key ? 'brand.500' : 'transparent'}
                position="relative"
                overflow="hidden"
                transition="all 0.2s"
                _hover={{ transform: 'scale(1.02)', shadow: 'md' }}
                bg={themeCardBg}
              >
                 <HStack spacing={0} h="48px">
                    {scheme.palette && scheme.palette.map((c, i) => (
                        <Box key={i} flex={1} bg={c} h="full" />
                    ))}
                 </HStack>
                 <Flex p={3} justify="space-between" align="center">
                    <Text fontSize="sm" fontWeight="bold">{scheme.name}</Text>
                    {colorScheme === key && (
                        <Icon as={FiDroplet} color="brand.500" />
                    )}
                 </Flex>
              </Box>
            ))}
        </SimpleGrid>
      </MotionBox>
    </VStack>
  );
};

export default GeneralSlide;
