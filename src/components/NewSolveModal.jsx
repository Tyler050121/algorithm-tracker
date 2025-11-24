import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
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
  Text,
  useColorModeValue,
  Badge,
  HStack,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

const DIFFICULTY_MAP = {
  easy: { color: 'green' },
  medium: { color: 'orange' },
  hard: { color: 'red' },
};

function NewSolveModal({ isOpen, onClose, onConfirm, problems = [] }) {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');

  const unstartedProblems = useMemo(
    () => problems.filter((problem) => problem.status === 'unstarted'),
    [problems]
  );

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return unstartedProblems;
    return unstartedProblems.filter(
      (problem) => {
        const name = (i18n.language === 'zh' ? problem.title.zh : problem.title.en) || problem.title.en || '';
        return name.toLowerCase().includes(keyword) || String(problem.id).includes(keyword);
      }
    );
  }, [unstartedProblems, search, i18n.language]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedId(unstartedProblems[0]?.id ? String(unstartedProblems[0].id) : '');
    }
  }, [isOpen, unstartedProblems]);

  useEffect(() => {
    if (!isOpen) return;
    if (selectedId && filtered.some((problem) => String(problem.id) === selectedId)) {
      return;
    }
    setSelectedId(filtered[0]?.id ? String(filtered[0].id) : '');
  }, [filtered, isOpen, selectedId]);

  const handleConfirm = () => {
    if (!selectedId) return;
    onConfirm(Number(selectedId));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>{t('newSolve.title')}</ModalHeader>
        <ModalBody>
          <Stack spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder={t('newSolve.searchPlaceholder')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </InputGroup>
            <Box 
              maxH="400px" 
              overflowY="auto" 
              bg={useColorModeValue('gray.50', 'gray.700')} 
              borderRadius="lg" 
              p={2}
              border="1px solid"
              borderColor={useColorModeValue('gray.100', 'gray.600')}
            >
              {filtered.length === 0 ? (
                <Text textAlign="center" color="gray.500" py={8}>
                  {t('newSolve.empty')}
                </Text>
              ) : (
                <RadioGroup value={selectedId} onChange={setSelectedId}>
                  <Stack spacing={0}>
                    {filtered.map((problem) => (
                      <Box 
                        key={problem.id} 
                        p={3} 
                        borderRadius="md" 
                        _hover={{ bg: useColorModeValue('white', 'gray.600'), shadow: 'sm' }}
                        transition="all 0.2s"
                        cursor="pointer"
                        onClick={() => setSelectedId(String(problem.id))}
                      >
                        <Radio value={String(problem.id)} colorScheme="brand" w="full">
                          <HStack spacing={2} align="center">
                            <Text fontWeight="semibold">
                              {(i18n.language === 'zh' ? problem.title.zh : problem.title.en) || problem.title.en}
                            </Text>
                            <Badge 
                              colorScheme={DIFFICULTY_MAP[problem.difficulty?.toLowerCase()]?.color || 'gray'} 
                              fontSize="xs" 
                              variant="subtle"
                            >
                              {problem.difficulty}
                            </Badge>
                          </HStack>
                          <Text fontSize="xs" color="gray.500" mt={0.5}>
                            #{problem.id} · {i18n.language === 'zh' ? problem.groupName.zh : problem.groupName.en}
                          </Text>
                        </Radio>
                      </Box>
                    ))}
                  </Stack>
                </RadioGroup>
              )}
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {t('newSolve.cancel')}
          </Button>
          <Button colorScheme="brand" isDisabled={!selectedId} onClick={handleConfirm}>
            {t('newSolve.confirm')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default NewSolveModal;
