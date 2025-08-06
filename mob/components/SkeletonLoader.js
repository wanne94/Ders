import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const SkeletonLoader = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style,
  variant = 'box' // box, circle, text
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'circle':
        return {
          width: typeof width === 'number' ? width : 50,
          height: typeof width === 'number' ? width : 50,
          borderRadius: typeof width === 'number' ? width / 2 : 25,
        };
      case 'text':
        return {
          width,
          height: 16,
          borderRadius: 4,
        };
      default:
        return {
          width,
          height,
          borderRadius,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        getVariantStyles(),
        { opacity },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
  },
});

export default SkeletonLoader;