import React, { useState, useEffect } from 'react';
import {
  VStack,
  Input,
  Select,
  Text,
  Button,
  useToast,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiEye, FiEyeOff, FiSave, FiServer } from 'react-icons/fi';
import SettingItem from './SettingItem';

const AISlide = () => {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState('openai');
  const toast = useToast();

  useEffect(() => {
    const storedProvider = localStorage.getItem('ai_provider');
    const storedKey = localStorage.getItem('ai_api_key');
    if (storedProvider) setProvider(storedProvider);
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('ai_api_key', apiKey);
    
    toast({
      title: t('common.saved', 'Saved'),
      description: "AI configuration has been updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={4} align="stretch">
      <SettingItem
        icon={FiServer}
        title="AI Provider"
        description="Select your AI service provider"
        action={
          <Select 
            w="150px" 
            size="sm" 
            value={provider} 
            onChange={(e) => setProvider(e.target.value)}
            borderRadius="md"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="gemini">Google Gemini</option>
            <option value="deepseek">DeepSeek</option>
          </Select>
        }
      />

      <FormControl>
        <FormLabel fontSize="sm" fontWeight="bold">API Key</FormLabel>
        <InputGroup size="md">
          <Input
            pr="4.5rem"
            type={showKey ? 'text' : 'password'}
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            borderRadius="md"
          />
          <InputRightElement width="3rem">
            <Button h="1.75rem" size="sm" variant="ghost" onClick={() => setShowKey(!showKey)}>
              {showKey ? <FiEyeOff /> : <FiEye />}
            </Button>
          </InputRightElement>
        </InputGroup>
        <Text fontSize="xs" color="gray.500" mt={1}>
          Your API key is stored locally on your device.
        </Text>
      </FormControl>

      <Button leftIcon={<FiSave />} colorScheme="brand" onClick={handleSave} alignSelf="flex-end">
        Save
      </Button>
    </VStack>
  );
};

export default AISlide;
