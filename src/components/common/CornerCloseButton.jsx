import React from 'react';
import { IconButton } from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';

function CornerCloseButton({
  onClick,
  ariaLabel = 'Close',
  size = 'sm',
  color = 'gray.500',
  position = 'absolute',
  top = 3,
  right = 3,
  zIndex = 10,
  ...rest
}) {
  return (
    <IconButton
      icon={<FiX />}
      variant="ghost"
      onClick={onClick}
      aria-label={ariaLabel}
      borderRadius="full"
      size={size}
      color={color}
      position={position}
      top={top}
      right={right}
      zIndex={zIndex}
      _hover={{ bg: 'blackAlpha.100', color: 'red.500', transform: 'rotate(90deg)' }}
      {...rest}
    />
  );
}

export default CornerCloseButton;
