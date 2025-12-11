import React, { useState, useRef } from 'react';
import { Flex, IconButton, useColorModeValue, Box, useOutsideClick } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaFont, 
  FaClock, 
  FaTachometerAlt, 
  FaStar,
  FaSort
} from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);

const MENU_ITEMS = [
  { id: 'default', icon: FaStar },
  { id: 'name', icon: FaFont },
  { id: 'complexity', icon: FaTachometerAlt },
  { id: 'updatedAt', icon: FaClock },
];

const SortMenu = ({ sortBy, sortOrder, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  useOutsideClick({
    ref: ref,
    handler: () => setIsOpen(false),
  });

  const toggleOpen = () => setIsOpen(!isOpen);

  // Colors
  const activeColor = useColorModeValue('brand.500', 'brand.200');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  const bg = useColorModeValue('white', 'gray.800');
  const shadow = useColorModeValue('lg', 'dark-lg');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  const handleSelect = (id) => {
    let newOrder = 'asc';
    if (sortBy === id) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      if (id === 'updatedAt' || id === 'default') {
        newOrder = 'desc'; 
      } else {
        newOrder = 'asc';
      }
    }
    onSortChange(id, newOrder);
  };

  const radius = 70;
  // Angles: 0 (Right) to 90 (Down)
  const startAngle = 0;
  const endAngle = 90;
  
  return (
    <Flex 
      ref={ref}
      position="relative" 
      w="40px" 
      h="40px" 
      zIndex={100} 
      align="center" 
      justify="center"
    >
      {/* Main Trigger Button */}
      <MotionIconButton
        icon={<FaSort />}
        isRound
        onClick={toggleOpen}
        aria-label="Sort Menu"
        size="sm"
        bg={isOpen ? activeColor : 'transparent'}
        color={isOpen ? 'white' : 'currentColor'}
        _hover={{ bg: isOpen ? activeColor : 'blackAlpha.100' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        zIndex={102}
        position="relative"
      />

      {/* Fan Items */}
      <AnimatePresence>
        {isOpen && MENU_ITEMS.map((item, index) => {
          // Calculate position on the arc
          // Range 0 to 90. 4 items.
          const step = (endAngle - startAngle) / (MENU_ITEMS.length - 1);
          const angle = startAngle + (index * step); // 0, 30, 60, 90
          const radian = (angle * Math.PI) / 180;
          
          const elementX = Math.cos(radian) * radius;
          const elementY = Math.sin(radian) * radius;

          const isActive = sortBy === item.id;

          return (
            <MotionBox
              key={item.id}
              position="absolute"
              // Start from center (Trigger is centered in 40x40 Flex)
              // Items are 32px (size="sm"). Flex is 40px. 
              // Center of Flex is 20,20.
              // If we put items at top=4px, left=4px, they are exactly behind trigger.
              top="4px"
              left="4px"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ 
                x: elementX, 
                y: elementY, 
                opacity: 1, 
                scale: 1,
                transition: { 
                  delay: index * 0.05, 
                  type: 'spring',
                  stiffness: 300,
                  damping: 20
                }
              }}
              exit={{ 
                x: 0, 
                y: 0, 
                opacity: 0, 
                scale: 0,
                transition: { duration: 0.2 }
              }}
              zIndex={101}
            >
              <IconButton
                icon={
                  <Box position="relative">
                    <item.icon />
                    {isActive && (
                      <Box position="absolute" bottom="-6px" right="-6px" fontSize="8px">
                        {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                      </Box>
                    )}
                  </Box>
                }
                isRound
                size="sm"
                bg={isActive ? activeColor : bg}
                color={isActive ? 'white' : inactiveColor}
                shadow={shadow}
                onClick={() => handleSelect(item.id)}
                _hover={{ scale: 1.1, bg: isActive ? activeColor : hoverBg }}
              />
            </MotionBox>
          );
        })}
      </AnimatePresence>
    </Flex>
  );
};

export default SortMenu;
