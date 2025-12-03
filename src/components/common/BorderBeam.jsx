import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const spin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
`;

const BorderBeam = ({ 
  duration = 4, 
  borderWidth = 1, 
  color,
  isVisible = true,
  ...props 
}) => {
  const defaultColor = useColorModeValue('rgba(49, 130, 206, 0.8)', 'rgba(144, 205, 244, 0.8)'); // brand.500 / brand.300
  const beamColor = color || defaultColor;

  return (
    <Box
      position="absolute"
      inset={0}
      pointerEvents="none"
      borderRadius="inherit"
      zIndex={10}
      opacity={isVisible ? 1 : 0}
      transition="opacity 0.3s"
      p={`${borderWidth}px`}
      sx={{
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        WebkitMaskComposite: 'xor',
      }}
      {...props}
    >
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width="300%" // Make it large enough to cover corners even for long elements
        height="300%"
        opacity={1}
        bg={`conic-gradient(from 0deg, transparent 0deg 300deg, ${beamColor} 360deg)`}
        animation={`${spin} ${duration}s linear infinite`}
      />
    </Box>
  );
};

export default BorderBeam;
