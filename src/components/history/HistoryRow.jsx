import React from 'react';
import {
  Box,
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
  Td,
  Text,
  Tr,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { format, parseISO } from 'date-fns';
import {
  FiEdit,
  FiRewind,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ReviewProgressBars from './ReviewProgressBars';
import { DifficultyMeter, TypeTag } from '../common/DifficultyBadge';

const HistoryRow = React.memo(({ item, newDate, setNewDate, onUndo, onUpdateDate, handleChartOpen }) => {
  const { t, i18n } = useTranslation();
  const dateObj = parseISO(item.date);
  const dateStr = format(dateObj, 'yyyy-MM-dd');
  const timeStr = format(dateObj, 'HH:mm');
  const dateColor = useColorModeValue('gray.800', 'gray.100');
  const titleColor = useColorModeValue('gray.700', 'gray.200');
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
  const metaColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Tr _hover={{ bg: hoverBg }}>
      <Td py={3}>
        <VStack spacing={0.5} align="start">
          <Text fontSize="sm" fontWeight="bold" color={dateColor} letterSpacing="-0.01em">
            {dateStr}
          </Text>
          <Text fontSize="xs" color={metaColor}>
            {timeStr}
          </Text>
        </VStack>
      </Td>
      <Td py={3} maxW={0}>
        <VStack spacing={1} align="start" w="full">
          <Text
            fontWeight="medium"
            noOfLines={1}
            color={titleColor}
            title={(i18n.language === 'zh' ? item.problem.title.zh : item.problem.title.en) || item.problem.title.en}
          >
            {(i18n.language === 'zh' ? item.problem.title.zh : item.problem.title.en) || item.problem.title.en}
          </Text>

          <HStack spacing={2} w="full" overflow="hidden">
            <Text fontSize="xs" color={metaColor} flexShrink={0}>
              #{item.problem.id}
            </Text>
            {item.plan && (
              <Text fontSize="xs" color={metaColor} noOfLines={1}>
                {t(`study_plans.${item.plan}.name`, item.plan)}
              </Text>
            )}
          </HStack>
        </VStack>
      </Td>
      <Td textAlign="center" py={3}>
        <DifficultyMeter difficulty={item.problem.difficulty} />
      </Td>
      <Td textAlign="center" py={3}>
        <TypeTag type={item.type} label={t(`history.actionType.${item.type}`)} />
      </Td>
      <Td textAlign="center" py={3}>
        <ReviewProgressBars problem={item.problem} onOpen={handleChartOpen} />
      </Td>
      <Td textAlign="center" py={3}>
        <HStack spacing={2} justify="center">
          <Popover
            placement="left"
            onOpen={() => setNewDate(format(parseISO(item.date), "yyyy-MM-dd'T'HH:mm"))}
          >
            {({ onClose }) => (
              <>
                <PopoverTrigger>
                  <IconButton aria-label={t('common.editDate')} icon={<FiEdit />} size="sm" variant="ghost" />
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
          <IconButton aria-label={t('common.undo')} icon={<FiRewind />} size="sm" variant="ghost" colorScheme="red" onClick={() => onUndo(item)} />
        </HStack>
      </Td>
    </Tr>
  );
});

HistoryRow.displayName = 'HistoryRow';

export default HistoryRow;
