import React, { useState, useEffect } from 'react';
import {
  VStack,
  Input,
  Text,
  Button,
  useToast,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel,
  Box,
  HStack,
  Icon,
  useColorModeValue,
  SimpleGrid,
    useToken,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { FiEye, FiEyeOff, FiSave, FiCpu, FiKey, FiServer, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { hexToRgba } from '../../../theme/deriveThemeColors';

const MotionBox = motion.create(Box);

const PROVIDERS = [
    { id: 'openai', name: 'OpenAI', desc: 'GPT-3.5 / GPT-4', tone: 'palette.4' },
    { id: 'anthropic', name: 'Anthropic', desc: 'Claude 3 Family', tone: 'palette.6' },
    { id: 'gemini', name: 'Google Gemini', desc: 'Gemini Pro / Ultra', tone: 'palette.2' },
    { id: 'deepseek', name: 'DeepSeek', desc: 'DeepSeek-V3', tone: 'palette.7' },
];

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
            title: t('settings.ai.savedTitle', 'Configuration Saved'),
            description: t('settings.ai.savedDesc', 'Your AI settings have been updated successfully.'),
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  const cardBg = useColorModeValue('white', 'whiteAlpha.100');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const providerActiveBg = useColorModeValue('brand.50', 'whiteAlpha.200');
  const providerActiveBorder = 'brand.500';

    const providerTone = PROVIDERS.find(p => p.id === provider)?.tone ?? 'palette.4';
    const providerToneTokens = PROVIDERS.map(p => p.tone);
    const providerToneHexes = useToken('colors', providerToneTokens);
    const [toneHex] = useToken('colors', [providerTone]);
    const headerIconBg = useColorModeValue(hexToRgba(toneHex, 0.18), hexToRgba(toneHex, 0.22));

  return (
    <VStack spacing={6} align="stretch" pb={8}>
       <MotionBox
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         p={6}
         bg={cardBg}
         borderRadius="2xl"
         borderWidth="1px"
         borderColor={borderColor}
         boxShadow="sm"
       >
         <HStack mb={6} spacing={3}>
            <Box w={10} h={10} display="flex" alignItems="center" justifyContent="center" bg={headerIconBg} borderRadius="lg" color={toneHex}>
                <Icon as={FiCpu} boxSize={5} />
            </Box>
            <Box>
                <Text fontWeight="bold" fontSize="lg">{t('settings.ai.headerTitle', 'AI Provider Settings')}</Text>
                <Text fontSize="sm" color="gray.500">{t('settings.ai.headerDesc', 'Configure connection to LLM services')}</Text>
            </Box>
         </HStack>

         <VStack spacing={8} align="stretch">
            {/* Provider Selection Grid */}
            <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm" color="gray.600" mb={3}>
                    <HStack>
                        <Icon as={FiServer} />
                        <Text>{t('settings.ai.selectProvider', 'Select Provider')}</Text>
                    </HStack>
                </FormLabel>
                <SimpleGrid columns={[1, 2]} spacing={3}>
                    {PROVIDERS.map((p, idx) => {
                        const isSelected = provider === p.id;
                        const pToneHex = providerToneHexes[idx];
                        return (
                            <Box
                                key={p.id}
                                as="button"
                                onClick={() => setProvider(p.id)}
                                p={4}
                                borderRadius="xl"
                                borderWidth="2px"
                                borderColor={isSelected ? providerActiveBorder : borderColor}
                                bg={isSelected ? providerActiveBg : 'transparent'}
                                transition="all 0.2s"
                                _hover={{ borderColor: isSelected ? providerActiveBorder : 'gray.400' }}
                                textAlign="left"
                                position="relative"
                            >
                                {isSelected && (
                                    <Box position="absolute" top={3} right={3} color="brand.500">
                                        <Icon as={FiCheck} />
                                    </Box>
                                )}
                                <HStack spacing={2} align="center">
                                  <Box w={2} h={2} borderRadius="full" bg={pToneHex} />
                                  <Text fontWeight="bold" fontSize="sm" color={isSelected ? 'brand.600' : 'inherit'}>
                                      {p.name}
                                  </Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.500">
                                    {p.desc}
                                </Text>
                            </Box>
                        );
                    })}
                </SimpleGrid>
            </FormControl>

            {/* API Key Input */}
            <FormControl>
                <FormLabel fontWeight="bold" fontSize="sm" color="gray.600">
                    <HStack>
                        <Icon as={FiKey} />
                        <Text>{t('settings.ai.apiKey', 'API Key')}</Text>
                    </HStack>
                </FormLabel>
                <InputGroup size="lg">
                    <Input
                        pr="4.5rem"
                        type={showKey ? 'text' : 'password'}
                                                placeholder={t('settings.ai.apiKeyPlaceholder', {
                                                    provider: PROVIDERS.find(p => p.id === provider)?.name,
                                                    defaultValue: `Enter your ${PROVIDERS.find(p => p.id === provider)?.name} API Key`,
                                                })}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        borderRadius="xl"
                        variant="filled"
                        bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
                        _focus={{ bg: 'transparent', borderColor: 'brand.500' }}
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" variant="ghost" onClick={() => setShowKey(!showKey)}>
                        {showKey ? <FiEyeOff /> : <FiEye />}
                        </Button>
                    </InputRightElement>
                </InputGroup>
                <Text fontSize="xs" color="gray.500" mt={2} display="flex" alignItems="center">
                    <Icon as={FiServer} mr={1} />
                    {t('settings.ai.storageHint', 'Keys are stored locally in your browser\'s LocalStorage.')}
                </Text>
            </FormControl>

            <Box pt={2} display="flex" justifyContent="flex-end">
                <Button 
                    leftIcon={<FiSave />} 
                    colorScheme="brand" 
                    size="lg" 
                    onClick={handleSave}
                    px={8}
                    borderRadius="xl"
                    boxShadow="md"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                >
                    {t('settings.ai.save', 'Save Changes')}
                </Button>
            </Box>
         </VStack>
       </MotionBox>
    </VStack>
  );
};

export default AISlide;
