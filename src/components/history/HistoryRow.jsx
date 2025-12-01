import React from 'react';
import {
  Button,
  ButtonGroup,
  HStack,
  IconButton,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Tag,
  Td,
  Text,
  Tooltip,
  Tr,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import { FiBarChart2, FiEdit, FiRewind } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import DifficultyBadge from '../common/DifficultyBadge';

const HistoryRow = React.memo(({ item, newDate, setNewDate, onUndo, onUpdateDate, handleChartOpen }) => {
  const { t, i18n } = useTranslation();
  const dateObj = parseISO(item.date);
  const dateStr = format(dateObj, 'yyyy-MM-dd');
  const timeStr = format(dateObj, 'HH:mm');
  const dateColor = useColorModeValue('gray.700', 'gray.200');
  const titleColor = useColorModeValue('gray.700', 'gray.200');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  return (
    <Tr _hover={{ bg: hoverBg }}>
      <Td py={3}>
        <VStack spacing={0} align="start">
          <Text fontSize="sm" fontWeight="bold" color={dateColor}>{dateStr}</Text>
          <Text fontSize="xs" color="gray.500">{timeStr}</Text>
        </VStack>
      </Td>
      <Td fontSize="xs" color="gray.500" py={3}>#{item.problem.id}</Td>
      <Td py={3}>
        <Text fontWeight="medium" noOfLines={1} maxW="250px" color={titleColor} title={(i18n.language === 'zh' ? item.problem.title.zh : item.problem.title.en) || item.problem.title.en}>
          {(i18n.language === 'zh' ? item.problem.title.zh : item.problem.title.en) || item.problem.title.en}
        </Text>
      </Td>
      <Td display={{ base: 'none', md: 'table-cell' }} textAlign="center" py={3}>
        {item.plan ? (
          <Tag size="sm" variant="subtle" colorScheme="gray" borderRadius="full">
            {t(`study_plans.${item.plan}.name`, item.plan)}
          </Tag>
        ) : (
          <Text color="gray.400">-</Text>
        )}
      </Td>
      <Td textAlign="center" py={3}>
        <DifficultyBadge difficulty={item.problem.difficulty} />
      </Td>
      <Td textAlign="center" py={3}>
        <Tag 
          size="sm" 
          colorScheme={item.type === 'learn' ? 'green' : 'blue'} 
          variant="subtle" 
          borderRadius="full" 
          fontWeight="bold"
        >
          {t(`history.actionType.${item.type}`)}
        </Tag>
      </Td>
      <Td textAlign="center" py={3}>
        <HStack spacing={2} justify="center">
          <Tooltip label={t('history.table.viewChart')}>
            <IconButton aria-label="Chart" icon={<FiBarChart2 />} size="sm" variant="ghost" onClick={() => handleChartOpen(item.problem)} />
          </Tooltip>
          <Popover
            placement="left"
            onOpen={() => setNewDate(format(parseISO(item.date), "yyyy-MM-dd'T'HH:mm"))}
          >
            {({ onClose }) => (
              <>
                <PopoverTrigger>
                  <IconButton aria-label="Edit Date" icon={<FiEdit />} size="sm" variant="ghost" />
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader>{t('common.editDate')}</PopoverHeader>
                  <PopoverBody>
                    <VStack>
                      <Input
                        type="datetime-local"
                        size="sm"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                      <ButtonGroup size="sm" alignSelf="flex-end">
                        <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
                        <Button
                          colorScheme="brand"
                          onClick={() => {
                            onUpdateDate(item, newDate);
                            onClose();
                          }}
                        >
                          {t('common.save')}
                        </Button>
                      </ButtonGroup>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </>
            )}
          </Popover>
          <Tooltip label={t('common.undo')}>
            <IconButton aria-label="Undo" icon={<FiRewind />} size="sm" variant="ghost" colorScheme="red" onClick={() => onUndo(item)} />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  );
});

HistoryRow.displayName = 'HistoryRow';

export default HistoryRow;
