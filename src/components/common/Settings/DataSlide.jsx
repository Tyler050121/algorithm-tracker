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
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiDatabase, FiCode, FiActivity, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

const ActionButton = ({ icon, title, onClick, colorScheme = "gray" }) => {
    const bg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    
    return (
        <Button
            variant="outline"
            height="auto"
            py={4}
            bg={bg}
            borderColor={borderColor}
            _hover={{ borderColor: 'brand.500', transform: 'translateY(-2px)', shadow: 'sm' }}
            onClick={onClick}
            display="flex"
            flexDirection="column"
            gap={2}
            w="100%"
        >
            <Icon as={icon} boxSize={5} color={colorScheme === 'red' ? 'red.500' : 'brand.500'} />
            <Text fontSize="sm" fontWeight="medium" whiteSpace="normal" textAlign="center">{title}</Text>
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

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase">
          {t('settings.dataManagement.export')}
        </Text>
        <SimpleGrid columns={3} spacing={3}>
            <ActionButton icon={FiDatabase} title={t('settings.dataManagement.exportAll')} onClick={() => onExport('all')} />
            <ActionButton icon={FiCode} title={t('settings.dataManagement.exportSolutions')} onClick={() => onExport('solutions')} />
            <ActionButton icon={FiActivity} title={t('settings.dataManagement.exportRecords')} onClick={() => onExport('records')} />
        </SimpleGrid>
      </Box>

      <Box>
        <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={3} textTransform="uppercase">
          {t('settings.dataManagement.import')}
        </Text>
        <SimpleGrid columns={3} spacing={3}>
            <ActionButton icon={FiDatabase} title={t('settings.dataManagement.importAll')} onClick={() => handleImportClick('all')} />
            <ActionButton icon={FiCode} title={t('settings.dataManagement.importSolutions')} onClick={() => handleImportClick('solutions')} />
            <ActionButton icon={FiActivity} title={t('settings.dataManagement.importRecords')} onClick={() => handleImportClick('records')} />
        </SimpleGrid>
      </Box>

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
            onClick={onOpen}
          >
            {t('settings.dataManagement.clear')}
          </Button>
        </HStack>
      </Box>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        <AlertDialogOverlay />
        <AlertDialogContent borderRadius="xl">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {t('settings.dataManagement.clearConfirm.title')}
          </AlertDialogHeader>
          <AlertDialogBody>
            {t('settings.dataManagement.clearConfirm.body')}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="ghost">
              {t('settings.dataManagement.clearConfirm.cancel')}
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                onClear();
                onClose();
              }}
              ml={3}
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
