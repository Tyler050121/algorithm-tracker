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
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

function NewSolveModal({ isOpen, onClose, onConfirm, problems = [] }) {
  const { t } = useTranslation();
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
      (problem) =>
        problem.name.toLowerCase().includes(keyword) || String(problem.id).includes(keyword)
    );
  }, [unstartedProblems, search]);

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
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
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
            <Box maxH="320px" overflowY="auto" borderWidth="1px" borderRadius="lg" p={3}>
              {filtered.length === 0 ? (
                <Text textAlign="center" color="gray.500">
                  {t('newSolve.empty')}
                </Text>
              ) : (
                <RadioGroup value={selectedId} onChange={setSelectedId}>
                  <Stack spacing={3}>
                    {filtered.map((problem) => (
                      <Radio key={problem.id} value={String(problem.id)}>
                        <Text fontWeight="semibold">{problem.name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          #{problem.id}
                        </Text>
                      </Radio>
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
          <Button colorScheme="teal" isDisabled={!selectedId} onClick={handleConfirm}>
            {t('newSolve.confirm')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default NewSolveModal;
