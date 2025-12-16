import React from "react";
import {
  Box,
  Circle,
  Flex,
  HStack,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { format, parseISO } from "date-fns";
import {
  FiRewind,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import ReviewProgressBars from "./ReviewProgressBars";
import { DifficultyMeter, TypeTag } from "../common/DifficultyBadge";

const TimelineItem = ({ item, isLast, onChartOpen, onUndo }) => {
  const { t, i18n } = useTranslation();
  const timeColor = useColorModeValue("gray.400", "gray.500");
  const lineColor = useColorModeValue("gray.200", "gray.700");
  const titleColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const isLearn = item.type === "learn";
  const dotColor = isLearn ? "brand.400" : "accent.400";
  const metaColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Flex gap={3} position="relative" pb={isLast ? 0 : 5}>
      {/* Time Column */}
      <Flex direction="column" align="flex-end" minW="48px" pt={1}>
        <Text
          fontSize="xs"
          fontWeight="bold"
          color={timeColor}
          fontFamily="monospace"
        >
          {format(parseISO(item.date), "HH:mm")}
        </Text>
      </Flex>

      {/* Line & Dot */}
      <Flex direction="column" align="center" position="relative">
        <Circle
          size="8px"
          bg={dotColor}
          zIndex={1}
          mt={1.5}
          ring={4}
          ringColor={useColorModeValue("white", "gray.800")}
        />
        {!isLast && (
          <Box
            w="1px"
            flex={1}
            bg={lineColor}
            position="absolute"
            top="10px"
            bottom={0}
          />
        )}
      </Flex>

      {/* Content */}
      <Box flex={1} pb={0}>
        <Flex
          justify="space-between"
          align="start"
          bg={cardBg}
          p={3}
          borderRadius="lg"
          ml={0.5}
        >
          <VStack align="start" spacing={2} flex={1}>
            <Text
              fontWeight="bold"
              fontSize="sm"
              color={titleColor}
              noOfLines={2}
              lineHeight="short"
            >
              {(i18n.language === "zh"
                ? item.problem.title.zh
                : item.problem.title.en) || item.problem.title.en}
            </Text>

            <HStack spacing={2} wrap="wrap" rowGap={1}>
              <TypeTag type={item.type} label={t(`history.actionType.${item.type}`)} />
              <DifficultyMeter
                difficulty={item.problem.difficulty}
              />
              <ReviewProgressBars problem={item.problem} onOpen={onChartOpen} size="xs" />
              {item.plan && (
                <Text fontSize="xs" color={metaColor} noOfLines={1}>
                  • {t(`study_plans.${item.plan}.name`, item.plan)}
                </Text>
              )}
            </HStack>
          </VStack>

          <HStack spacing={0} mt={-1}>
            <IconButton
              aria-label={t("common.undo")}
              icon={<FiRewind />}
              size="xs"
              variant="ghost"
              colorScheme="red"
              opacity={0.5}
              _hover={{ opacity: 1 }}
              onClick={() => onUndo(item)}
            />
          </HStack>
        </Flex>
      </Box>
    </Flex>
  );
};

export default TimelineItem;
