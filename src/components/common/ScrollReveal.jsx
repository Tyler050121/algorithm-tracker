import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';

const ScrollReveal = ({ children, animation = 'fade', stagger = 0, ...props }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.disconnect();
    };
  }, []);

  const animationClass = isVisible ? `reveal-${animation}` : 'waiting-reveal';
  const staggerClass = stagger > 0 ? `stagger-${Math.min(stagger, 6)}` : '';
  
  // waiting-reveal handles visibility: hidden to solve "No opacity 0" constraint visually
  const waitingStyle = !isVisible ? { visibility: 'hidden' } : {};

  return (
    <Box
      ref={ref}
      className={`${animationClass} ${staggerClass}`}
      style={waitingStyle}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ScrollReveal;
