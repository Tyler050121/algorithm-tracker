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
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

function SettingsModal({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleLanguageChange = (nextLanguage) => {
    i18n.changeLanguage(nextLanguage);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('settings.title')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>{t('settings.close')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default SettingsModal;