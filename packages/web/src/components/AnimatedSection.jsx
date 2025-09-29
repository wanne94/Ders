import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedSection = ({ 
  children, 
  sectionKey,
  direction = 'horizontal',
  duration = 0.3
}) => {
  const variants = {
    horizontal: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -100 }
    },
    vertical: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -50 }
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 }
    }
  };

  const selectedVariants = variants[direction] || variants.horizontal;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sectionKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={selectedVariants}
        transition={{
          duration: duration,
          ease: [0.4, 0, 0.2, 1] // Material Design easing
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedSection;