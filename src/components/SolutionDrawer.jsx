import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Input,
  Link,
  Stack,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

const emptyForm = { title: '', notes: '', link: '' };

function SolutionDrawer({ problem, isOpen, onClose, onAddSolution, onDeleteSolution }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [activeProblem, setActiveProblem] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (problem) {
      setActiveProblem(problem);
    }
    if (isOpen) {
      setForm(emptyForm);
    }
  }, [isOpen, problem]);

  if (!activeProblem) {
    return null;
  }

  const handleAdd = () => {
    if (!form.title.trim() && !form.notes.trim()) {
      toast({ title: t('solutions.addWarning'), status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    onAddSolution(activeProblem.id, {
      title: form.title.trim() || t('solutions.unnamed'),
      notes: form.notes.trim(),
      link: form.link.trim(),
    });
    setForm(emptyForm);
    toast({ title: t('solutions.addSuccess'), status: 'success', duration: 1500, isClosable: true });
  };

  const statusText = t(`problems.status.${activeProblem.status}`, activeProblem.status);

  return (
    <Drawer isOpen={isOpen} placement="right" size="lg" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">
          <Text fontSize="lg" fontWeight="bold">
            {t('solutions.header')} {activeProblem.name}
          </Text>
          <Text fontSize="sm" color="gray.500">
            #{activeProblem.id} · {t('solutions.status', { status: statusText })}
          </Text>
        </DrawerHeader>

        <DrawerBody>
          <Stack spacing={6}>
            <Box>
              <Text fontWeight="semibold" mb={3}>
                {t('solutions.saved')}
              </Text>
              {activeProblem.solutions.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  {t('solutions.empty')}
                </Text>
              ) : (
                <Stack spacing={4}>
                  {activeProblem.solutions.map((solution) => (
                    <Box key={solution.id} p={4} borderWidth="1px" borderRadius="lg">
                      <Flex justify="space-between" align="flex-start" mb={2}>
                        <Box>
                          <Text fontWeight="semibold">{solution.title}</Text>
                          <Badge mt={1} colorScheme="gray">
                            {t('solutions.createdAt', { date: solution.createdAt ?? '?' })}
                          </Badge>
                        </Box>
                        <IconButton
                          aria-label={t('solutions.deleteTooltip')}
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => onDeleteSolution(activeProblem.id, solution.id)}
                        />
                      </Flex>
                      {solution.notes && (
                        <Text whiteSpace="pre-wrap" fontSize="sm" color="gray.700">
                          {solution.notes}
                        </Text>
                      )}
                      {solution.link && (
                        <Link
                          href={solution.link}
                          isExternal
                          display="inline-flex"
                          alignItems="center"
                          gap={1}
                          mt={2}
                          color="teal.500"
                          fontSize="sm"
                        >
                          {t('solutions.viewExternal')}
                          <ExternalLinkIcon />
                        </Link>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Box>
              <Text fontWeight="semibold" mb={3}>
                {t('solutions.addTitle')}
              </Text>
              <Stack spacing={3}>
                <Input
                  placeholder={t('solutions.titlePlaceholder')}
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
                <Textarea
                  placeholder={t('solutions.notesPlaceholder')}
                  minH="140px"
                  value={form.notes}
                  onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
                <Input
                  placeholder={t('solutions.linkPlaceholder')}
                  value={form.link}
                  onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
                />
                <Button colorScheme="teal" onClick={handleAdd}>
                  {t('solutions.addButton')}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button variant="ghost" mr={3} onClick={onClose}>
            {t('settings.close')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default SolutionDrawer;
