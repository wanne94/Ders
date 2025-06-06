import { useState, useEffect } from 'react';

export const useScrollDirection = (threshold = 10) => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const updateScrollDirection = (scrollY) => {
    const scrollDifference = scrollY - lastScrollY;

    // Ignore small scroll movements
    if (Math.abs(scrollDifference) < threshold) {
      return;
    }

    // Always show header when at top
    if (scrollY < 50) {
      setIsVisible(true);
      setScrollDirection('up');
    } else {
      // Hide on scroll down, show on scroll up
      if (scrollDifference > 0) {
        setScrollDirection('down');
        setIsVisible(false);
      } else {
        setScrollDirection('up');
        setIsVisible(true);
      }
    }

    setLastScrollY(scrollY);
  };

  return {
    scrollDirection,
    isVisible,
    updateScrollDirection
  };
}; 