import React, { useRef, useState } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
const SpotlightCard = ({ children, noBorder = false, ...props }) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const defaultBg = useColorModeValue('white', 'gray.800');
  const defaultBorderColor = useColorModeValue('gray.100', 'gray.700');
  // Use a darker spotlight for light mode (shadow-like) or brand tint, 
  // and white for dark mode.
  const spotlightColor = useColorModeValue('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.06)');

  return (
    <Box
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      position="relative"
      overflow="hidden"
      zIndex="0" // Establish stacking context so zIndex="-1" overlay sits above background
      bg={props.bg || defaultBg}
      border={noBorder ? 'none' : '1px solid'}
      borderColor={props.borderColor || defaultBorderColor}
      {...props} // Apply layout props (flex, display, etc.) to the container directly
    >
       <Box
         position="absolute"
         inset="-1px" // Extend to cover the border area
         zIndex="-1" // Place behind content but above parent background
         pointerEvents="none"
         style={{
           background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 10%)`,
           opacity: isHovered ? 1 : 0,
           transition: 'opacity 0.3s',
         }}
       />
       {children}
    </Box>
  );
};

export default SpotlightCard;
