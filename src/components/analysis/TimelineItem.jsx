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
import './analysis.css';

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
    <Flex className={`timeline-row ${isLast ? 'last' : ''}`}>
      {/* Time Column */}
      <Flex className="timeline-item-container">
        <Text
          className="timeline-time-text"
          color={timeColor}
        >
          {format(parseISO(item.date), "HH:mm")}
        </Text>
      </Flex>

      {/* Line & Dot */}
      <Flex className="timeline-dot-container">
        <Circle
          className="timeline-dot"
          bg={dotColor}
          ring={4}
          ringColor={useColorModeValue("white", "gray.800")}
        />
        {!isLast && (
          <Box
            className="timeline-line"
            bg={lineColor}
          />
        )}
      </Flex>

      {/* Content */}
      <Box className="timeline-content-box">
        <Flex
          className="timeline-card"
          bg={cardBg}
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
