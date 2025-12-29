import React from 'react';
import { Box, HStack, useColorModeValue } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { REVIEW_INTERVALS } from '../../constants';
import './analysis.css';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const flash = keyframes`
  0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 var(--flashRing); }
  50% { transform: scale(1.08); opacity: 0.88; box-shadow: 0 0 0 1px var(--flashRing); }
  100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 var(--flashRing); }
`;

const ReviewProgressBars = ({
  problem,
  onOpen,
  size = 'sm',
  selectedIndex,
  onSelectIndex,
  enableHover = true,
}) => {
  const emptyBg = useColorModeValue('blackAlpha.220', 'whiteAlpha.220');
  const emptyBorder = useColorModeValue('blackAlpha.300', 'whiteAlpha.320');
  const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100');
  const selectedRing = useColorModeValue('rgba(0,0,0,0.45)', 'rgba(255,255,255,0.75)');

  const learnFilled = useColorModeValue('brand.600', 'brand.300');
  const reviewFilled = useColorModeValue('accent.600', 'accent.300');

  const total = REVIEW_INTERVALS.length + 1; // learn + N reviews
  const learned = Array.isArray(problem?.learnHistory) && problem.learnHistory.length > 0 ? 1 : 0;
  const reviews = Array.isArray(problem?.reviewHistory) ? problem.reviewHistory.length : 0;
  const done = clamp(learned + reviews, 0, total);

  const spacing = size === 'xs' ? 0.5 : 1;
  const paddingX = size === 'xs' ? 1 : 2;
  const paddingY = size === 'xs' ? 0.5 : 1;

  return (
    <HStack
      spacing={spacing}
      justify="center"
      cursor={onSelectIndex || onOpen ? 'pointer' : 'default'}
      userSelect="none"
      onClick={onSelectIndex ? undefined : () => onOpen?.(problem)}
      role={onSelectIndex || onOpen ? 'button' : undefined}
      aria-label={onSelectIndex || onOpen ? 'review-progress' : 'review-progress'}
      px={paddingX}
      py={paddingY}
      borderRadius="md"
      _hover={enableHover && (onSelectIndex || onOpen) ? { bg: hoverBg } : undefined}
      display="inline-flex"
    >
      {Array.from({ length: total }).map((_, i) => {
        const filled = i === 0 ? learnFilled : reviewFilled;
        const isSelected = typeof selectedIndex === 'number' && selectedIndex === i;
        const sizeClass = `review-progress-dot-${size}`;
        return (
          <Box
            key={i}
            className={`review-progress-dot ${sizeClass}`}
            bg={i < done ? filled : emptyBg}
            borderColor={i < done ? 'transparent' : emptyBorder}
            sx={isSelected ? { '--flashRing': selectedRing } : undefined}
            animation={isSelected ? `${flash} 1100ms ease-in-out infinite` : undefined}
            willChange={isSelected ? 'transform, opacity, box-shadow' : undefined}
            onClick={(e) => {
              if (!onSelectIndex) return;
              e.stopPropagation();
              onSelectIndex(i);
            }}
          />
        );
      })}
    </HStack>
  );
};

export default ReviewProgressBars;
