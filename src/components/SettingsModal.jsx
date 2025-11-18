import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  useColorMode,
  Divider,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  VStack,
  ButtonGroup,
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { DeleteIcon, DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';

function SettingsModal({ isOpen, onClose, onExport, onImport, onClear }) {
  const { t, i18n } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef();
  const fileInputRef = useRef();

  const handleLanguageChange = (nextLanguage) => {
    i18n.changeLanguage(nextLanguage);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('settings.title')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <Stack spacing={6}>
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="dark-mode-switch" mb="0">
                {t('settings.darkMode')}
              </FormLabel>
              <Switch
                id="dark-mode-switch"
                isChecked={colorMode === 'dark'}
                onChange={toggleColorMode}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t('settings.language')}</FormLabel>
              <RadioGroup onChange={handleLanguageChange} value={i18n.language}>
                <Stack direction="row" spacing={5}>
                  <Radio value="en">English</Radio>
                  <Radio value="zh">简体中文</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
          </Stack>

          <Divider my={4} />

          <VStack spacing={2} align="stretch">
            <FormLabel mb={1}>{t('settings.dataManagement.title')}</FormLabel>
            <HStack spacing={3}>
              <Button onClick={onExport} leftIcon={<DownloadIcon />} variant="outline" size="sm" colorScheme="blue">
                {t('settings.dataManagement.export')}
              </Button>
              <Button onClick={handleImportClick} leftIcon={<ExternalLinkIcon />} variant="outline" size="sm" colorScheme="green">
                {t('settings.dataManagement.import')}
              </Button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileChange} />
              <Button onClick={onAlertOpen} leftIcon={<DeleteIcon />} colorScheme="red" variant="outline" size="sm">
                {t('settings.dataManagement.clear')}
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>

    <AlertDialog isOpen={isAlertOpen} leastDestructiveRef={cancelRef} onClose={onAlertClose}>
      <ModalOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {t('settings.dataManagement.clearConfirm.title')}
          </AlertDialogHeader>
          <AlertDialogBody>{t('settings.dataManagement.clearConfirm.body')}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onAlertClose}>
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
      </ModalOverlay>
    </AlertDialog>
    </>
  );
}

export default SettingsModal;