import React, { useState, useRef, useEffect } from "react";
import {
  Flex,
  Box,
  VStack,
  Text,
  HStack,
  Button,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  Divider,
  Icon,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { FaRegLightbulb, FaCode, FaFire } from "react-icons/fa";
import { useTranslation } from "react-i18next";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import { PROGRAMMING_LANGUAGES } from "../../../constants";
import MarkdownRenderer from "./MarkdownRenderer";
import { formatDate, getTagColor } from "./utils";

const SolutionItem = ({ solution }) => {
  const { t } = useTranslation();
  const [activeCodeTab, setActiveCodeTab] = useState(0);
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const syntaxTheme = useColorModeValue(oneLight, oneDark);
  const tabActiveBg = useColorModeValue("white", "gray.700");
  const tabHoverBg = useColorModeValue("gray.100", "gray.600");
  const tabHeaderBg = useColorModeValue("gray.50", "gray.800");
  const sectionBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const activeColor = useColorModeValue("brand.500", "brand.300");

  if (!solution) return null;

  return (
    <Box maxW="full" mx="auto" py={4}>
      <VStack align="start" spacing={6}>
        <Box w="full">
          <Flex justify="space-between" align="center" mb={2}>
            <HStack>
              <Text fontSize="sm" color="gray.500">
                {formatDate(solution.updatedAt || solution.createdAt)}
              </Text>
              {solution.pinned && (
                <Icon as={FaFire} color="orange.500" boxSize={3} ml={2} />
              )}
            </HStack>
            <HStack>
              {solution.link && (
                <Button
                  as="a"
                  href={solution.link}
                  target="_blank"
                  size="xs"
                  rightIcon={<ExternalLinkIcon />}
                  variant="link"
                  colorScheme="brand"
                  mr={4}
                >
                  {t("solutions.viewExternal")}
                </Button>
              )}
            </HStack>
          </Flex>
          <Text fontSize="3xl" fontWeight="bold">
            {solution.title}
          </Text>

          {(solution.timeComplexity ||
            solution.spaceComplexity ||
            (solution.tags && solution.tags.length > 0)) && (
            <Wrap spacing={3} mt={3}>
              {/* 时间/空间复杂度徽章 */}
              {(solution.timeComplexity || solution.spaceComplexity) && (
                <>
                  {solution.timeComplexity && (
                    <WrapItem>
                      <Badge
                        colorScheme="orange"
                        variant="subtle"
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        {t("solutions.timeComplexity", "Time")}:{" "}
                        {solution.timeComplexity}
                      </Badge>
                    </WrapItem>
                  )}
                  {solution.spaceComplexity && (
                    <WrapItem>
                      <Badge
                        colorScheme="blue"
                        variant="subtle"
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        {t("solutions.spaceComplexity", "Space")}:{" "}
                        {solution.spaceComplexity}
                      </Badge>
                    </WrapItem>
                  )}
                </>
              )}

              {/* 标签 */}
              {(solution.tags || []).map((tag) => (
                <WrapItem key={tag}>
                  <Tag
                    size="md"
                    variant="subtle"
                    colorScheme={getTagColor(tag)}
                    borderRadius="full"
                  >
                    <TagLabel>{t(`tags.${tag}`, tag)}</TagLabel>
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          )}
        </Box>

        <Divider />

        <Box w="full">
          {solution.notes && (
            <Box mb={6}>
              <HStack mb={3} spacing={2}>
                <Icon as={FaRegLightbulb} color="yellow.500" boxSize={5} />
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {t("solutions.thought", "思路")}
                </Text>
              </HStack>
              <Box
                px={5}
                pt={5}
                pb={2}
                bg={sectionBg}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
              >
                <MarkdownRenderer content={solution.notes} />
              </Box>
            </Box>
          )}

          {(solution.codes || []).length > 0 && (
            <Box>
              <HStack mb={3} spacing={2}>
                <Icon as={FaCode} color="blue.500" boxSize={5} />
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color="gray.500"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {t("solutions.code", "代码")}
                </Text>
              </HStack>
              <Box
                borderRadius="lg"
                overflow="hidden"
                border="1px solid"
                borderColor={borderColor}
                boxShadow="sm"
              >
                <Flex
                  bg={tabHeaderBg}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  px={2}
                  pt={2}
                >
                  <HStack spacing={2} overflowX="auto" pb={0} pt={1}>
                    {solution.codes.map((code, idx) => (
                      <Box
                        key={idx}
                        px={4}
                        py={2}
                        bg={activeCodeTab === idx ? tabActiveBg : "transparent"}
                        borderTopRadius="md"
                        border="1px solid"
                        borderColor={
                          activeCodeTab === idx ? borderColor : "transparent"
                        }
                        borderBottomColor={
                          activeCodeTab === idx ? tabActiveBg : borderColor
                        }
                        cursor="pointer"
                        onClick={() => setActiveCodeTab(idx)}
                        _hover={{
                          bg: activeCodeTab !== idx && tabHoverBg,
                        }}
                        position="relative"
                      >
                        <Text
                          fontSize="xs"
                          fontWeight={activeCodeTab === idx ? "bold" : "medium"}
                          color={activeCodeTab === idx ? activeColor : "gray.500"}
                          textAlign="center"
                        >
                          {PROGRAMMING_LANGUAGES.find(
                            (l) => l.value === code.language
                          )?.label || code.language}
                        </Text>
                      </Box>
                    ))}
                  </HStack>
                </Flex>
                <Box>
                  <SyntaxHighlighter
                    language={solution.codes[activeCodeTab]?.language || "cpp"}
                    style={syntaxTheme}
                    customStyle={{
                      margin: 0,
                      fontSize: "14px",
                      padding: "1.5rem",
                    }}
                    showLineNumbers
                  >
                    {solution.codes[activeCodeTab]?.content || ""}
                  </SyntaxHighlighter>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

const SolutionViewer = ({ solution, onNavigate }) => {
  const scrollContainerRef = useRef(null);
  const lastScrollTime = useRef(0); // For navigation debounce
  const scrollAccumulator = useRef(0);
  const resetTimer = useRef(null);

  // Inertia detection state
  const lastWheelEventTime = useRef(0);
  const lastDeltaY = useRef(0);
  const potentialInertia = useRef(false);
  const wasAtTop = useRef(true);
  const wasAtBottom = useRef(false);
  const cleanupTimestamp = useRef(0);

  // Reset states when solution changes
  useEffect(() => {
    scrollAccumulator.current = 0;
    wasAtTop.current = true;
    wasAtBottom.current = false;
    potentialInertia.current = false;
    // Force lock for 300ms to allow render and prevent inertia leak
    cleanupTimestamp.current = Date.now() + 300;
  }, [solution.id]);

  const handleWheel = (e) => {
    const now = Date.now();
    const dt = now - lastWheelEventTime.current;
    const { deltaY } = e;

    // Force Lock: Ignore all events during navigation/render phase
    if (now < cleanupTimestamp.current) {
      lastWheelEventTime.current = now;
      lastDeltaY.current = deltaY;
      return;
    }

    // Short debounce for function re-entry protection
    if (now - lastScrollTime.current < 200) {
      scrollAccumulator.current = 0;
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5;
    const isTop = scrollTop === 0;

    // Detect edge arrival
    const justHitBottom = isBottom && !wasAtBottom.current;
    const justHitTop = isTop && !wasAtTop.current;
    
    if (justHitBottom || justHitTop) {
      potentialInertia.current = true;
      scrollAccumulator.current = 0;
    }

    let shouldIgnore = false;
    if (potentialInertia.current && (isBottom || isTop)) {
      // Logic to distinguish Inertia vs Active Scroll
      // 1. High Frequency (dt < 50): Could be Trackpad Inertia OR Mouse Rapid Scroll
      if (dt < 50) {
          // Check for Mouse characteristics: Stable and Large Delta (e.g., 100, 100, 100)
          const isStableLarge = Math.abs(deltaY) > 50 && Math.abs(deltaY - lastDeltaY.current) < 5;
          // Check for Intentional Acceleration (Finger push)
          const isAccelerating = Math.abs(deltaY) > Math.abs(lastDeltaY.current) * 1.2;

          if (isStableLarge || isAccelerating) {
              // Active intent detected -> Unlock
              potentialInertia.current = false;
          } else {
              // Likely Inertia (Decaying, Fluctuating, or Small) -> Lock
              shouldIgnore = true;
          }
      } else {
          // Low Frequency (dt >= 50): User paused or is scrolling slowly -> Unlock
          potentialInertia.current = false;
      }
    } else {
      potentialInertia.current = false;
    }

    // Update state for next event
    lastWheelEventTime.current = now;
    lastDeltaY.current = deltaY;
    wasAtBottom.current = isBottom;
    wasAtTop.current = isTop;

    if (shouldIgnore) return;

    // Threshold for triggering navigation (pixels of "virtual" scrolling)
    const THRESHOLD = 150;

    // Clear existing reset timer
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }

    // Set new reset timer: if no scroll event for 500ms, reset accumulator
    resetTimer.current = setTimeout(() => {
      scrollAccumulator.current = 0;
    }, 500);

    if (e.deltaY > 0 && isBottom) {
      // Accumulate downward scroll at bottom
      scrollAccumulator.current += e.deltaY;
      
      if (scrollAccumulator.current > THRESHOLD) {
        if (onNavigate) {
          onNavigate("next");
          lastScrollTime.current = now;
          scrollAccumulator.current = 0;
          cleanupTimestamp.current = now + 300;
        }
      }
    } else if (e.deltaY < 0 && isTop) {
      // Accumulate upward scroll at top (deltaY is negative)
      scrollAccumulator.current += e.deltaY;
      
      if (scrollAccumulator.current < -THRESHOLD) {
        if (onNavigate) {
          onNavigate("prev");
          lastScrollTime.current = now;
          scrollAccumulator.current = 0;
          cleanupTimestamp.current = now + 300;
        }
      }
    } else {
      // Not at boundary or scrolling away from boundary -> reset
      scrollAccumulator.current = 0;
    }
  };

  return (
    <Flex direction="column" h="full">
      <Box
        ref={scrollContainerRef}
        flex={1}
        overflowY="auto"
        px={24}
        py={12}
        onWheel={handleWheel}
        css={{
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          '-ms-overflow-style': 'none',
        }}
      >
        <AnimatePresence
          mode="wait"
          onExitComplete={() => {
            if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTop = 0;
            }
          }}
        >
          <motion.div
            key={solution.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SolutionItem solution={solution} />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Flex>
  );
};

export default SolutionViewer;
