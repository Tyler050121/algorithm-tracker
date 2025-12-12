import React, { useRef } from 'react';
import {
  VStack,
  SimpleGrid,
  Button,
  Icon,
  Text,
  useColorModeValue,
  Box,
  HStack,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
  Divider,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiDatabase, FiCode, FiActivity, FiTrash2, FiAlertTriangle, FiDownload, FiUpload } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const ActionButton = ({ icon, title, onClick, colorScheme = "gray", description }) => {
    const bg = useColorModeValue('white', 'whiteAlpha.100');
    const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
    const hoverBorder = useColorModeValue('brand.500', 'brand.400');
    
    return (
        <Button
            as={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variant="outline"
            height="auto"
            py={6}
            bg={bg}
            borderColor={borderColor}
            _hover={{ borderColor: hoverBorder, shadow: 'md' }}
            onClick={onClick}
            display="flex"
            flexDirection="column"
            gap={3}
            w="100%"
            borderRadius="xl"
            borderWidth="2px"
        >
            <Box 
              p={3} 
              borderRadius="full" 
              bg={useColorModeValue(colorScheme === 'red' ? 'red.50' : 'brand.50', 'whiteAlpha.200')}
              color={colorScheme === 'red' ? 'red.500' : 'brand.500'}
            >
              <Icon as={icon} boxSize={6} />
            </Box>
            <VStack spacing={0}>
              <Text fontSize="sm" fontWeight="bold" whiteSpace="normal" textAlign="center">{title}</Text>
              {description && <Text fontSize="xs" color="gray.500" fontWeight="normal">{description}</Text>}
            </VStack>
        </Button>
    )
}

const DataSlide = ({ onExport, onImport, onClear }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const importTypeRef = useRef('all');

  const handleImportClick = (type) => {
    importTypeRef.current = type;
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImport(file, importTypeRef.current);
      event.target.value = ''; 
    }
  };

  const sectionBorder = useColorModeValue('gray.100', 'whiteAlpha.100');

  return (
    <VStack spacing={8} align="stretch" pb={10}>
      
      {/* 导出区域 */}
      <Box>
        <HStack mb={4} spacing={3}>
           <Box p={2} bg="blue.100" borderRadius="lg" color="blue.600">
               <Icon as={FiDownload} boxSize={5} />
           </Box>
           <Box>
               <Text fontSize="lg" fontWeight="bold">{t('settings.dataManagement.export')}</Text>
               <Text fontSize="xs" color="gray.500">Backup your data to a JSON file</Text>
           </Box>
        </HStack>
        
        <SimpleGrid columns={[1, 3]} spacing={4}>
            <ActionButton 
                icon={FiDatabase} 
                title={t('settings.dataManagement.exportAll')} 
                description="Everything"
                onClick={() => onExport('all')} 
            />
            <ActionButton 
                icon={FiCode} 
                title={t('settings.dataManagement.exportSolutions')} 
                description="Only Code"
                onClick={() => onExport('solutions')} 
            />
            <ActionButton 
                icon={FiActivity} 
                title={t('settings.dataManagement.exportRecords')} 
                description="History Stats"
                onClick={() => onExport('records')} 
            />
        </SimpleGrid>
      </Box>

      <Divider borderColor={sectionBorder} />

      {/* 导入区域 */}
      <Box>
        <HStack mb={4} spacing={3}>
           <Box p={2} bg="green.100" borderRadius="lg" color="green.600">
               <Icon as={FiUpload} boxSize={5} />
           </Box>
           <Box>
               <Text fontSize="lg" fontWeight="bold">{t('settings.dataManagement.import')}</Text>
               <Text fontSize="xs" color="gray.500">Restore data from a JSON file</Text>
           </Box>
        </HStack>

        <SimpleGrid columns={[1, 3]} spacing={4}>
            <ActionButton 
                icon={FiDatabase} 
                title={t('settings.dataManagement.importAll')} 
                description="Restore All"
                onClick={() => handleImportClick('all')} 
            />
            <ActionButton 
                icon={FiCode} 
                title={t('settings.dataManagement.importSolutions')} 
                description="Restore Code"
                onClick={() => handleImportClick('solutions')} 
            />
            <ActionButton 
                icon={FiActivity} 
                title={t('settings.dataManagement.importRecords')} 
                description="Restore Stats"
                onClick={() => handleImportClick('records')} 
            />
        </SimpleGrid>
      </Box>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileChange} />

      {/* 危险区域 */}
      <MotionBox 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        mt={4}
        p={5} 
        borderWidth="1px" 
        borderColor="red.200" 
        borderRadius="2xl" 
        bg={useColorModeValue('red.50', 'rgba(254, 178, 178, 0.05)')}
        position="relative"
        overflow="hidden"
      >
        {/* 背景条纹装饰 */}
        <Box 
            position="absolute" 
            top={0} right={0} w="100px" h="100px" 
            bg="red.400" 
            opacity={0.05} 
            borderRadius="full" 
            transform="translate(30%, -30%)"
        />

        <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack spacing={4}>
            <Box p={3} bg="red.100" borderRadius="full" color="red.600">
                <Icon as={FiAlertTriangle} boxSize={5} />
            </Box>
            <Box>
              <Text fontWeight="bold" color="red.600" fontSize="md">{t('settings.dataManagement.dangerZone')}</Text>
              <Text fontSize="sm" color="red.500">{t('settings.dataManagement.clearDesc')}</Text>
            </Box>
          </HStack>
          <Button 
            colorScheme="red" 
            variant="solid" 
            leftIcon={<FiTrash2 />}
            onClick={onOpen}
            size="md"
            borderRadius="lg"
            px={6}
          >
            {t('settings.dataManagement.clear')}
          </Button>
        </HStack>
      </MotionBox>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered motionPreset="slideInBottom">
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <AlertDialogContent borderRadius="2xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {t('settings.dataManagement.clearConfirm.title')}
          </AlertDialogHeader>
          <AlertDialogBody>
            {t('settings.dataManagement.clearConfirm.body')}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="ghost" borderRadius="lg">
              {t('settings.dataManagement.clearConfirm.cancel')}
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                onClear();
                onClose();
              }}
              ml={3}
              borderRadius="lg"
            >
              {t('settings.dataManagement.clearConfirm.confirm')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VStack>
  );
};

export default DataSlide;
