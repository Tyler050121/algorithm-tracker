import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  VStack,
  HStack,
  Text,
  Box,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Flex,
  Collapse,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { 
  FiMoon, FiSun, FiGlobe, FiBook, FiDownload, FiUpload, 
  FiTrash2, FiAlertTriangle, FiChevronDown, FiCheck, FiChevronUp, FiDroplet,
  FiDatabase, FiCode, FiActivity
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppTheme } from '../../context/ThemeContext';

const MotionFlex = motion.create(Flex);
const MotionBox = motion.create(Box);

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

const SettingItem = ({ icon, title, description, action, index = 0 }) => {
  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.4)', 'rgba(45, 55, 72, 0.4)');
  
  return (
    <MotionFlex 
      align="center" 
      justify="space-between" 
      p={4} 
      bg={cardBg}
      boxShadow="sm"
      borderRadius="lg"
      _hover={{ boxShadow: 'md', bg: useColorModeValue('rgba(255, 255, 255, 0.6)', 'rgba(45, 55, 72, 0.6)') }}
      sx={{ transition: 'all 0.3s ease' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <HStack spacing={4}>
        <Flex
          align="center"
          justify="center"
          w={10}
          h={10}
          borderRadius="full"
          bg={useColorModeValue('brand.50', 'whiteAlpha.100')}
          color="brand.500"
        >
          <Icon as={icon} boxSize={5} />
        </Flex>
        <Box>
          <Text fontWeight="bold" fontSize="sm">{title}</Text>
          {description && <Text fontSize="xs" color="gray.500">{description}</Text>}
        </Box>
      </HStack>
      <Box>{action}</Box>
    </MotionFlex>
  );
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
  const { t, i18n } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  // 恢复了 Theme Context 的使用
  const { colorScheme, changeColorScheme, schemes } = useAppTheme();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef();
  const fileInputRef = useRef();
  const [isPlanExpanded, setIsPlanExpanded] = useState(false);
  const [importType, setImportType] = useState('all');

  const bgHover = useColorModeValue('gray.100', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const planCardBg = useColorModeValue('gray.50', 'gray.700');
  const planCardSelectedBg = useColorModeValue('brand.50', 'brand.900');
  const planCardBorder = useColorModeValue('gray.200', 'gray.600');
  const planCardSelectedBorder = useColorModeValue('brand.500', 'brand.400');

  const handleLanguageChange = (nextLanguage) => {
    i18n.changeLanguage(nextLanguage);
  };

  const handleImportClick = (type) => {
    setImportType(type);
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImport(file, importType);
      // 重置 input 以便允许重复上传同名文件
      event.target.value = ''; 
      setImportType('all');
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg" motionPreset="slideInBottom" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" transition="all 0.3s ease" />
        <ModalContent 
          borderRadius="2xl" 
          maxH="85vh"
          bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)')}
          backdropFilter="blur(20px) saturate(180%)"
          boxShadow="2xl"
          borderWidth="0px"
          transition="all 0.3s ease"
        >
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor} py={4} bg="transparent">
            {t('settings.title')}
          </ModalHeader>
          <ModalCloseButton top="14px" />
          <ModalBody p={6} bg="transparent">
            <VStack spacing={8} align="stretch" key={isOpen ? 'open' : 'closed'}>
              
              {/* General Settings Section */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase" letterSpacing="wider">
                  {t('settings.general')}
                </Text>
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

                  {/* 4. Study Plan */}
                  <Box>
                    <SettingItem
                      index={3}
                      icon={FiBook}
                      title={t('settings.studyPlan.title')}
                      description={t('settings.studyPlanDesc') || "Select the problem set you are working on"}
                      action={
                        <Button
                          size="sm"
                          rightIcon={isPlanExpanded ? <FiChevronUp /> : <FiChevronDown />}
                          onClick={() => setIsPlanExpanded(!isPlanExpanded)}
                          variant="outline"
                          colorScheme={isPlanExpanded ? 'brand' : 'gray'}
                        >
                          {t(`study_plans.${currentPlanSlug}.name`, { lng: i18n.language })}
                        </Button>
                      }
                    />
                    <Collapse in={isPlanExpanded} animateOpacity>
                      <Box 
                        mt={2} 
                        p={4} 
                        bg={cardBg} 
                        borderRadius="lg" 
                        boxShadow="inner"
                      >
                        <SimpleGrid columns={1} spacing={3}>
                          {studyPlans.map((plan, idx) => {
                            const isSelected = currentPlanSlug === plan.slug;
                            return (
                              <MotionBox
                                key={plan.slug}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => {
                                  onSelectPlan(plan.slug);
                                  setIsPlanExpanded(false);
                                }}
                                cursor="pointer"
                                p={3}
                                borderRadius="md"
                                bg={isSelected ? planCardSelectedBg : planCardBg}
                                borderWidth="1px"
                                borderColor={isSelected ? planCardSelectedBorder : planCardBorder}
                                _hover={{ borderColor: 'brand.400', transform: 'scale(1.02)' }}
                                position="relative"
                              >
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold" fontSize="sm" color={isSelected ? 'brand.500' : 'inherit'}>
                                      {t(`study_plans.${plan.slug}.name`, { lng: i18n.language })}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                      {t(`study_plans.${plan.slug}.desc`, { lng: i18n.language })}
                                    </Text>
                                  </VStack>
                                  {isSelected && <Icon as={FiCheck} color="brand.500" />}
                                </HStack>
                              </MotionBox>
                            );
                          })}
                        </SimpleGrid>
                      </Box>
                    </Collapse>
                  </Box>
                </VStack>
              </Box>

              {/* Data Management Section */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase" letterSpacing="wider">
                  {t('settings.dataManagement.title')}
                </Text>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={2} spacing={4}>
                    <Menu placement="bottom" isLazy autoSelect={false}>
                      <MenuButton
                        as={Button}
                        height="80px"
                        variant="outline"
                        bg={cardBg}
                        borderColor={borderColor}
                        _hover={{ borderColor: 'brand.500', bg: bgHover, transform: 'translateY(-2px)', shadow: 'md' }}
                        _active={{ transform: 'scale(0.98)' }}
                        transition="all 0.2s"
                        w="100%"
                        p={0}
                      >
                        <Flex direction="column" align="center" justify="center" gap={2} h="100%" w="100%">
                          <Icon as={FiDownload} boxSize={5} color="brand.500" />
                          <Text fontSize="sm" fontWeight="bold">{t('settings.dataManagement.export')}</Text>
                        </Flex>
                      </MenuButton>
                      <MenuList 
                        borderRadius="xl" 
                        p={2} 
                        shadow="xl" 
                        borderColor={borderColor} 
                        bg={cardBg}
                        zIndex={1500}
                      >
                        <MenuItem 
                          icon={<Icon as={FiDatabase} boxSize={4} color="brand.500" />} 
                          onClick={() => onExport('all')}
                          borderRadius="md"
                          mb={1}
                          fontWeight="medium"
                          _hover={{ bg: bgHover, color: 'brand.500' }}
                        >
                          {t('settings.dataManagement.exportAll')}
                        </MenuItem>
                        <MenuItem 
                          icon={<Icon as={FiCode} boxSize={4} color="blue.500" />} 
                          onClick={() => onExport('solutions')}
                          borderRadius="md"
                          mb={1}
                          fontWeight="medium"
                          _hover={{ bg: bgHover, color: 'blue.500' }}
                        >
                          {t('settings.dataManagement.exportSolutions')}
                        </MenuItem>
                        <MenuItem 
                          icon={<Icon as={FiActivity} boxSize={4} color="green.500" />} 
                          onClick={() => onExport('records')}
                          borderRadius="md"
                          fontWeight="medium"
                          _hover={{ bg: bgHover, color: 'green.500' }}
                        >
                          {t('settings.dataManagement.exportRecords')}
                        </MenuItem>
                      </MenuList>
                    </Menu>
                    
                    <Menu placement="bottom" isLazy autoSelect={false}>
                      <MenuButton
                        as={Button}
                        height="80px"
                        variant="outline"
                        bg={cardBg}
                        borderColor={borderColor}
                        _hover={{ borderColor: 'brand.500', bg: bgHover, transform: 'translateY(-2px)', shadow: 'md' }}
                        _active={{ transform: 'scale(0.98)' }}
                        transition="all 0.2s"
                        w="100%"
                        p={0}
                      >
                        <Flex direction="column" align="center" justify="center" gap={2} h="100%" w="100%">
                          <Icon as={FiUpload} boxSize={5} color="accent.500" />
                          <Text fontSize="sm" fontWeight="bold">{t('settings.dataManagement.import')}</Text>
                        </Flex>
                      </MenuButton>
                      <MenuList 
                        borderRadius="xl" 
                        p={2} 
                        shadow="xl" 
                        borderColor={borderColor} 
                        bg={cardBg}
                        zIndex={1500}
                      >
                        <MenuItem 
                          icon={<Icon as={FiDatabase} boxSize={4} color="accent.500" />} 
                          onClick={() => handleImportClick('all')}
                          borderRadius="md"
                          mb={1}
                          fontWeight="medium"
                          _hover={{ bg: bgHover, color: 'accent.500' }}
                        >
                          {t('settings.dataManagement.importAll')}
                        </MenuItem>
                        <MenuItem 
                          icon={<Icon as={FiCode} boxSize={4} color="blue.500" />} 
                          onClick={() => handleImportClick('solutions')}
                          borderRadius="md"
                          mb={1}
                          fontWeight="medium"
                          _hover={{ bg: bgHover, color: 'blue.500' }}
                        >
                          {t('settings.dataManagement.importSolutions')}
                        </MenuItem>
                        <MenuItem 
                          icon={<Icon as={FiActivity} boxSize={4} color="green.500" />} 
                          onClick={() => handleImportClick('records')}
                          borderRadius="md"
                          fontWeight="medium"
                          _hover={{ bg: bgHover, color: 'green.500' }}
                        >
                          {t('settings.dataManagement.importRecords')}
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </SimpleGrid>
                  
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileChange} />

                  <Box 
                    p={4} 
                    borderWidth="1px" 
                    borderColor="red.200" 
                    borderRadius="lg" 
                    bg={useColorModeValue('red.50', 'rgba(254, 178, 178, 0.1)')}
                  >
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={FiAlertTriangle} color="red.500" />
                        <Box>
                          <Text fontWeight="bold" color="red.600" fontSize="sm">{t('settings.dataManagement.dangerZone')}</Text>
                          <Text fontSize="xs" color="red.500">{t('settings.dataManagement.clearDesc')}</Text>
                        </Box>
                      </HStack>
                      <Button 
                        size="sm" 
                        colorScheme="red" 
                        variant="solid" 
                        leftIcon={<FiTrash2 />}
                        onClick={onAlertOpen}
                      >
                        {t('settings.dataManagement.clear')}
                      </Button>
                    </HStack>
                  </Box>
                </VStack>
              </Box>

            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <AlertDialogContent borderRadius="xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {t('settings.dataManagement.clearConfirm.title')}
          </AlertDialogHeader>
          <AlertDialogBody>
            {t('settings.dataManagement.clearConfirm.body')}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onAlertClose} variant="ghost">
              {t('settings.dataManagement.clearConfirm.cancel')}
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                onClear();
                onAlertClose();
              }}
              ml={3}
            >
              {t('settings.dataManagement.clearConfirm.confirm')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default SettingsModal;