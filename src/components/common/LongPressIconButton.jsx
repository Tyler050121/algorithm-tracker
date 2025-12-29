import React, { useState, useRef } from 'react';
import { IconButton, Box, CircularProgress, CircularProgressLabel } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionCircle = motion.circle;

const LongPressIconButton = ({ 
  icon, 
  onClick, 
  duration = 800, 
  ariaLabel, 
  colorScheme = "gray",
  size = "xs",
  ...props 
}) => {
  const [isPressing, setIsPressing] = useState(false);
  // progress goes from 0 to 100
  const [progress, setProgress] = useState(0); 
  const reqRef = useRef(null);
  const startTimeRef = useRef(null);

  // Map Chakra UI sizes to pixel dimensions for the SVG
  const sizeMap = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
  };
  const btnSize = sizeMap[size] || 24;
  const strokeWidth = 1.5;
  const radius = (btnSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const startPress = (e) => {
    // Prevent default to avoid text selection or other side effects
    if (e.cancelable) e.preventDefault();
    
    setIsPressing(true);
    startTimeRef.current = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p * 100);

      if (p < 1) {
        reqRef.current = requestAnimationFrame(animate);
      } else {
        // Completed
        setIsPressing(false);
        setProgress(0);
        if (onClick) onClick();
      }
    };
    
    reqRef.current = requestAnimationFrame(animate);
  };

  const cancelPress = () => {
    setIsPressing(false);
    setProgress(0);
    if (reqRef.current) cancelAnimationFrame(reqRef.current);
  };

  return (
    <Box position="relative" display="inline-flex" alignItems="center" justifyContent="center">
      {isPressing && (
        <Box
          position="absolute"
          top="-4px"
          left="-4px"
          right="-4px"
          bottom="-4px"
          pointerEvents="none"
        >
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${btnSize + 8} ${btnSize + 8}`}
                style={{ transform: 'rotate(-90deg)' }}
            >
                <MotionCircle
                    cx={(btnSize + 8) / 2}
                    cy={(btnSize + 8) / 2}
                    r={(btnSize + 8) / 2 - 2} // Slightly smaller to fit stroke
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    color={`${colorScheme}.400`}
                    style={{ stroke: `var(--chakra-colors-${colorScheme}-400)` }}
                    strokeDasharray={circumference * 1.5}
                    strokeDashoffset={(circumference * 1.5) * (1 - progress / 100)}
                />
            </svg>
        </Box>
      )}

      {/* 
        Better approach: Use a standard CircularProgress around it? 
        Or just simple overlay. 
        Let's try a custom SVG overlay that exactly matches the button size + padding.
      */}
      
       <svg
        width={btnSize + 8}
        height={btnSize + 8}
        style={{
          position: 'absolute',
          top: -4,
          left: -4,
          transform: 'rotate(-90deg)',
          pointerEvents: 'none',
          display: isPressing ? 'block' : 'none'
        }}
      >
        {/* Track circle (optional, maybe faint) */}
        <circle
          cx={(btnSize + 8) / 2}
          cy={(btnSize + 8) / 2}
          r={(btnSize) / 2 + 2}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.1"
          strokeWidth="1.5"
        />
        {/* Progress circle */}
        <circle
          cx={(btnSize + 8) / 2}
          cy={(btnSize + 8) / 2}
          r={(btnSize) / 2 + 2}
          fill="none"
          stroke={`var(--chakra-colors-${colorScheme}-500)`}
          strokeWidth="1.5"
          strokeDasharray={2 * Math.PI * ((btnSize) / 2 + 2)}
          strokeDashoffset={2 * Math.PI * ((btnSize) / 2 + 2) * (1 - progress / 100)}
          strokeLinecap="round"
        />
      </svg>

      <IconButton
        icon={icon}
        aria-label={ariaLabel}
        size={size}
        colorScheme={colorScheme}
        borderRadius="full"
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        {...props}
        // Disable default click since we use long press
        onClick={() => {
            // We only trigger on long press completion
        }}
        css={{
            touchAction: 'none', // Prevent scrolling while pressing
            userSelect: 'none',
        }}
      />
    </Box>
  );
};

export default LongPressIconButton;
