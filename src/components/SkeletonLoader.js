import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../config/theme';

// Simple animated skeleton without external dependencies
const SimpleSkeletonItem = ({ width = '100%', height = 20, style = {} }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e8e8e8', '#f5f5f5'],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor,
          borderRadius: 4,
        },
        style,
      ]}
    />
  );
};

// Skeleton for list items (lectures, organizations, daije)
export const ListItemSkeleton = () => (
  <View style={styles.listItem}>
    <View style={styles.listItemContent}>
      <SimpleSkeletonItem height={20} style={{ marginBottom: 8 }} />
      <SimpleSkeletonItem height={16} width="80%" style={{ marginBottom: 6 }} />
      <SimpleSkeletonItem height={14} width="60%" style={{ marginBottom: 4 }} />
      <SimpleSkeletonItem height={14} width="60%" />
    </View>
    <SimpleSkeletonItem width={60} height={60} style={{ borderRadius: 8 }} />
  </View>
);

// Skeleton for detail screens
export const DetailSkeleton = () => (
  <View style={styles.detail}>
    <SimpleSkeletonItem height={250} width="100%" />
    <View style={styles.detailContent}>
      <SimpleSkeletonItem height={28} width="70%" style={{ marginBottom: 20 }} />
      <View style={styles.detailCard}>
        <SimpleSkeletonItem height={16} style={{ marginBottom: 12 }} />
        <SimpleSkeletonItem height={16} style={{ marginBottom: 12 }} />
        <SimpleSkeletonItem height={16} />
      </View>
      <View style={styles.detailCard}>
        <SimpleSkeletonItem height={14} style={{ marginBottom: 8 }} />
        <SimpleSkeletonItem height={14} style={{ marginBottom: 8 }} />
        <SimpleSkeletonItem height={14} />
      </View>
    </View>
  </View>
);

// Skeleton for home screen cards
export const HomeCardSkeleton = () => (
  <View style={styles.homeCard}>
    <SimpleSkeletonItem height={20} width="60%" style={{ marginBottom: 12 }} />
    <SimpleSkeletonItem height={14} style={{ marginBottom: 8 }} />
    <SimpleSkeletonItem height={14} />
  </View>
);

// Multiple skeleton items for lists
export const ListSkeleton = ({ count = 5 }) => (
  <View style={styles.listContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <ListItemSkeleton key={index} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  listItemContent: {
    flex: 1,
    marginRight: 12,
  },
  detail: {
    flex: 1,
  },
  detailContent: {
    padding: 20,
    marginTop: -20,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  homeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
}); 