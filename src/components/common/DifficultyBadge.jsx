import { Badge, Box, HStack, Icon, useColorModeValue } from "@chakra-ui/react";
import { FiBookOpen, FiCheckCircle, FiRefreshCcw, FiZap } from "react-icons/fi";

const getDifficultyLevel = (difficulty) => {
  const d = String(difficulty ?? "").toLowerCase();
  if (d === "easy") return 1;
  if (d === "medium") return 2;
  if (d === "hard") return 3;
  return 0;
};

const getDifficultyTone = (difficulty) => {
  const d = String(difficulty ?? "").toLowerCase().trim();
  if (d === "easy") return "difficulty.easy";
  if (d === "medium") return "difficulty.medium";
  if (d === "hard") return "difficulty.hard";
  return "neutral";
};

export const DifficultyMeter = ({ difficulty, ...props }) => {
  const level = getDifficultyLevel(difficulty);
  const tone = getDifficultyTone(difficulty);
  const filled = useColorModeValue(`${tone}.600`, `${tone}.300`);
  const empty = useColorModeValue("gray.300", "whiteAlpha.600");

  return (
    <HStack
      spacing={0.5}
      px={0}
      py={0}
      alignItems="flex-end"
      display="inline-flex"
      aria-label={`difficulty:${difficulty}`}
      {...props}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          as="span"
          w="4px"
          h={i === 0 ? "6px" : i === 1 ? "8px" : "10px"}
          borderRadius="sm"
          bg={level >= i + 1 ? filled : empty}
        />
      ))}
    </HStack>
  );
};

export const TypeTag = ({ type, label, ...props }) => {
  const icon =
    type === "learn"
      ? FiBookOpen
      : type === "review"
      ? FiRefreshCcw
      : type === "solve"
      ? FiCheckCircle
      : FiZap;
  const isLearn = type === "learn";

  return (
    <Badge
      variant="subtle"
      colorScheme={isLearn ? "brand" : "accent"}
      fontSize="10px"
      px={1.5}
      py={0.5}
      borderRadius="md"
      display="inline-flex"
      alignItems="center"
      gap={1}
      {...props}
    >
      <Icon as={icon} boxSize={3} />
      {label}
    </Badge>
  );
};

export default DifficultyMeter;
