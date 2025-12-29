import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { ExternalLinkIcon, CheckIcon } from '@chakra-ui/icons';
import { LuExternalLink, LuBookOpen } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import DifficultyMeter from '../common/DifficultyBadge';
import LongPressIconButton from '../common/LongPressIconButton';

const ProblemItem = ({ problem, i18n, onOpenSolutions, onAction, actionIcon, actionLabel, actionColorScheme = "gray", actionVariant, enableLongPress, isLast }) => {
    const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.100", "gray.700");
    
    // 获取难度对应的颜色
    const getDifficultyTone = (diff) => {
        const d = String(diff ?? "").toLowerCase().trim();
        if (d === "easy") return "difficulty.easy";
        if (d === "medium") return "difficulty.medium";
        if (d === "hard") return "difficulty.hard";
        return "neutral";
    };
    
    const diffColor = getDifficultyTone(problem.difficulty);
    const title = (i18n.language === "zh" ? problem.title.zh : problem.title.en) || problem.title.en;

    return (
        <Flex
            py={3}
            px={2}
            align="center"
            justify="space-between"
            minH="50px"
            position="relative"
            borderBottomWidth={isLast ? 0 : "1px"}
            borderColor={borderColor}
            _hover={{
                bg: hoverBg,
                transform: "translateX(4px)",
            }}
            transition="all 0.2s"
            borderRadius="md"
        >
            <VStack align="start" spacing={0.5} flex={1} overflow="hidden" mr={3}>
                <HStack spacing={2.5} width="100%" align="center">
                    <DifficultyMeter difficulty={problem.difficulty} />
                    <Text fontSize="sm" fontWeight="semibold" isTruncated title={title} lineHeight="shorter">
                        {title}
                    </Text>
                </HStack>
                <HStack spacing={2.5}>
                     <Text fontSize="xs" color="gray.500" fontFamily="mono">#{problem.id}</Text>
                     {problem.topic && (
                        <Text fontSize="xs" color="gray.400" isTruncated maxW="140px">• {problem.topic}</Text>
                     )}
                </HStack>
            </VStack>

            <HStack spacing={1}>
                <IconButton
                    icon={<LuExternalLink />}
                    size="xs"
                    variant="ghost"
                    color="gray.400"
                    _hover={{ color: `${diffColor}.500`, bg: `${diffColor}.50` }}
                    onClick={(e) => {
                    e.preventDefault();
                    window.open(`https://leetcode.cn/problems/${problem.slug}/`, "_blank");
                    }}
                    aria-label="Open Link"
                />
                <IconButton
                    icon={<LuBookOpen />}
                    size="xs"
                    variant="ghost"
                    color={problem.solutions?.length > 0 ? "yellow.400" : "gray.400"}
                    _hover={{ color: `${diffColor}.500`, bg: `${diffColor}.50` }}
                    onClick={() => onOpenSolutions(problem.id)}
                    aria-label="View Solutions"
                />
                {enableLongPress ? (
                    <LongPressIconButton
                        icon={actionIcon}
                        size="xs"
                        colorScheme={actionColorScheme}
                        variant={actionVariant || (actionColorScheme === "gray" ? "ghost" : "solid")}
                        onClick={() => onAction(problem.id)}
                        ariaLabel={actionLabel}
                        duration={800}
                    />
                ) : (
                    <IconButton
                        icon={actionIcon}
                        size="xs"
                        colorScheme={actionColorScheme}
                        variant={actionVariant || (actionColorScheme === "gray" ? "ghost" : "solid")}
                        borderRadius="full"
                        _hover={{ transform: "scale(1.1)" }}
                        onClick={() => onAction(problem.id)}
                        aria-label={actionLabel}
                    />
                )}
            </HStack>
        </Flex>
    );
};

const ProblemListCard = ({
    title,
    subtitle,
    icon,
    iconBg,
    iconColor,
    problems,
    onOpenSolutions,
    onAction,
    actionIcon = <CheckIcon />,
    actionLabel = "Done",
    actionColorScheme,
    actionVariant,
    emptyText,
    headerExtra,
    headerRight,
    onActiveSectionChange,
    grouped = false,
    enableLongPress = false
}) => {
  const { i18n } = useTranslation();
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorderColor = useColorModeValue("gray.100", "gray.700");
  const hoverBorderColor = useColorModeValue("gray.200", "gray.600");
  const scrollContainerRef = React.useRef(null);

  const totalCount = grouped
    ? problems.reduce((acc, group) => acc + group.problems.length, 0)
    : problems.length;

  React.useEffect(() => {
    if (!grouped || !onActiveSectionChange || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const detectionLine = containerRect.top + 100; // Detect what's at 100px from top

      let activeId = null;

      for (const group of problems) {
        if (group.id) {
          const el = document.getElementById(`review-group-${group.id}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            // Check if the element contains the detection line
            // Or if it's the last one and near bottom?
            // Simple logic: Is the element covering the detection line?
            if (rect.top <= detectionLine && rect.bottom > detectionLine) {
              activeId = group.id;
              break;
            }
          }
        }
      }

      // Fallback: If nothing found (e.g. gap, or very top/bottom), pick first/last visible?
      // If we are at the very top, pick the first one.
      if (!activeId && container.scrollTop < 50 && problems.length > 0) {
         activeId = problems[0].id;
      }

      if (activeId) {
        onActiveSectionChange(activeId);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', onScroll);
    // Initial check
    handleScroll();

    return () => container.removeEventListener('scroll', onScroll);
  }, [problems, grouped, onActiveSectionChange]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      bg={cardBg}
      borderRadius="2xl"
      py={3}
      px={4}
      boxShadow="none"
      borderWidth="1px"
      borderColor={cardBorderColor}
      h="full"
      minH="0"
      overflow="visible"
      position="relative"
      transition="all 0.3s ease"
      _hover={{
        boxShadow: "none",
        borderColor: hoverBorderColor,
      }}
    >
      <Flex justify="space-between" align="center" mb={3} flexShrink={0} gap={4}>
        <HStack spacing={3} flexShrink={0}>
          <Flex p={1.5} bg={iconBg} color={iconColor} borderRadius="lg">
            <Icon as={icon} boxSize={4} />
          </Flex>
          <VStack align="start" spacing={0}>
             <Text fontWeight="bold" fontSize="md" noOfLines={1}>{title}</Text>
             {subtitle && <Text fontSize="xs" color="gray.500" noOfLines={1}>{subtitle}</Text>}
          </VStack>
        </HStack>

        {/* Middle Area (Timeline) */}
        {headerExtra && (
            <Box flex={1} minW={0} overflowX="auto">
                {headerExtra}
            </Box>
        )}

        {/* Right Area (Badge) */}
        <Box flexShrink={0}>
            {headerRight ? headerRight : (
                <Badge colorScheme="gray" borderRadius="full" px={2}>
                    {totalCount}
                </Badge>
            )}
        </Box>
      </Flex>

      <VStack
        ref={scrollContainerRef}
        spacing={2.5}
        align="stretch"
        overflowY="auto"
        justify={totalCount > 0 && totalCount <= 3 ? "center" : "flex-start"}
        flex={1}
        pr={0}
        sx={{
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none", // Firefox
          "-ms-overflow-style": "none", // IE/Edge
        }}
      >
        {grouped ? (
            problems.map((group, idx) => (
                group.problems.length > 0 && (
                    <Box key={idx} mb={2} id={group.id ? `review-group-${group.id}` : undefined} scrollMarginTop="50px">
                         <Box mb={2} mt={idx === 0 ? 0 : 4} px={2}>
                            {typeof group.label === 'string' ? (
                                <Text fontSize="xs" fontWeight="bold" color="gray.500">{group.label}</Text>
                            ) : (
                                group.label
                            )}
                         </Box>
                        <VStack spacing={0} align="stretch">
                             {group.problems.map((problem, pIdx) => (
                                <ProblemItem 
                                    key={problem.id}
                                    problem={problem}
                                    i18n={i18n}
                                    onOpenSolutions={onOpenSolutions}
                                    onAction={onAction}
                                    actionIcon={actionIcon}
                                    actionLabel={actionLabel}
                                    actionColorScheme={actionColorScheme}
                                    actionVariant={actionVariant}
                                    enableLongPress={enableLongPress}
                                    isLast={pIdx === group.problems.length - 1}
                                />
                             ))}
                        </VStack>
                    </Box>
                )
            ))
        ) : (
            problems.map((problem, idx) => (
                <ProblemItem 
                    key={problem.id}
                    problem={problem}
                    i18n={i18n}
                    onOpenSolutions={onOpenSolutions}
                    onAction={onAction}
                    actionIcon={actionIcon}
                    actionLabel={actionLabel}
                    actionColorScheme={actionColorScheme}
                    actionVariant={actionVariant}
                    enableLongPress={enableLongPress}
                    isLast={idx === problems.length - 1}
                />
            ))
        )}

        {totalCount === 0 && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="full"
            color="gray.400"
            py={6}
          >
            <Icon as={icon} boxSize={6} mb={2} opacity={0.5} />
            <Text fontSize="xs">{emptyText}</Text>
          </Flex>
        )}
      </VStack>
    </Box>
  );
};

export default ProblemListCard;
