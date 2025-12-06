import React, { useState, useRef } from 'react';
import { Flex, Box } from '@chakra-ui/react';

const ResizableSplitPane = ({ left, right, initialSplit = 50 }) => {
  const [split, setSplit] = useState(initialSplit);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newSplit = ((e.clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(Math.max(newSplit, 20), 80));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'default';
  };

  return (
    <Flex ref={containerRef} h="full" w="full" overflow="hidden">
      <Box w={`${split}%`} h="full" overflow="hidden">
        {left}
      </Box>
      <Box
        w="1px"
        bg="gray.200"
        position="relative"
        _hover={{ bg: 'brand.500' }}
        transition="background 0.2s"
        zIndex={10}
      >
        <Box
          position="absolute"
          left="-4px"
          right="-4px"
          top="0"
          bottom="0"
          cursor="col-resize"
          onMouseDown={handleMouseDown}
          zIndex={11}
        />
      </Box>
      <Box w={`calc(${100 - split}% - 1px)`} h="full" overflow="hidden">
        {right}
      </Box>
    </Flex>
  );
};

export default ResizableSplitPane;
