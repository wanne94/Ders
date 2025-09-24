import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


const COLORS = {
  skeleton: '#e0e0e0',
  shimmer: '#f5f5f5',
  background: '#f8f8f8'
};

const SkeletonItem = ({ style, shimmer = true }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shimmer) {
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
    }
  }, [animatedValue, shimmer]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View style={[styles.skeleton, style, shimmer && { opacity }]}>
      <LinearGradient
        colors={[COLORS.skeleton, COLORS.shimmer, COLORS.skeleton]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
    </Animated.View>
  );
};

const LoadingSkeleton = ({ type = 'list', count = 5 }) => {
  const renderListItem = () => (
    <View style={styles.listItem}>
      <SkeletonItem style={styles.listItemImage} />
      <View style={styles.listItemContent}>
        <SkeletonItem style={styles.listItemTitle} />
        <SkeletonItem style={styles.listItemSubtitle} />
        <View style={styles.listItemFooter}>
          <SkeletonItem style={styles.listItemChip} />
          <SkeletonItem style={styles.listItemChip} />
        </View>
      </View>
    </View>
  );

  const renderCardItem = () => (
    <View style={styles.card}>
      <SkeletonItem style={styles.cardImage} />
      <View style={styles.cardContent}>
        <SkeletonItem style={styles.cardTitle} />
        <SkeletonItem style={styles.cardDescription} />
        <SkeletonItem style={styles.cardDescriptionShort} />
        <View style={styles.cardFooter}>
          <SkeletonItem style={styles.cardButton} />
          <SkeletonItem style={styles.cardButton} />
        </View>
      </View>
    </View>
  );

  const renderDetailsSkeleton = () => (
    <View style={styles.details}>
      <SkeletonItem style={styles.detailsImage} />
      <View style={styles.detailsContent}>
        <SkeletonItem style={styles.detailsTitle} />
        <SkeletonItem style={styles.detailsSubtitle} />
        <View style={styles.detailsSection}>
          <SkeletonItem style={styles.detailsLabel} />
          <SkeletonItem style={styles.detailsValue} />
        </View>
        <View style={styles.detailsSection}>
          <SkeletonItem style={styles.detailsLabel} />
          <SkeletonItem style={styles.detailsValue} />
        </View>
        <View style={styles.detailsSection}>
          <SkeletonItem style={styles.detailsLabel} />
          <SkeletonItem style={styles.detailsValueLong} />
        </View>
      </View>
    </View>
  );

  const renderStatsSkeleton = () => (
    <View style={styles.stats}>
      <View style={styles.statsHeader}>
        <SkeletonItem style={styles.statsTitle} />
        <SkeletonItem style={styles.statsSubtitle} />
      </View>
      <View style={styles.statsChart}>
        {[...Array(12)].map((_, index) => (
          <View key={index} style={styles.statsBar}>
            <SkeletonItem 
              style={[
                styles.statsBarFill,
                { height: Math.random() * 80 + 20 }
              ]} 
            />
          </View>
        ))}
      </View>
      <View style={styles.statsFooter}>
        <SkeletonItem style={styles.statsTotal} />
      </View>
    </View>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return [...Array(count)].map((_, index) => (
          <View key={index}>{renderCardItem()}</View>
        ));
      case 'details':
        return renderDetailsSkeleton();
      case 'stats':
        return renderStatsSkeleton();
      case 'list':
      default:
        return [...Array(count)].map((_, index) => (
          <View key={index}>{renderListItem()}</View>
        ));
    }
  };

  return (
    <View style={styles.container}>
      {renderSkeleton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  skeleton: {
    backgroundColor: COLORS.skeleton,
    overflow: 'hidden',
  },
  // List item styles
  listItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  listItemSubtitle: {
    height: 16,
    borderRadius: 4,
    marginBottom: 12,
    width: '50%',
  },
  listItemFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  listItemChip: {
    height: 24,
    width: 60,
    borderRadius: 12,
  },
  // Card styles
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    height: 24,
    borderRadius: 4,
    marginBottom: 12,
    width: '80%',
  },
  cardDescription: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
    width: '100%',
  },
  cardDescriptionShort: {
    height: 16,
    borderRadius: 4,
    marginBottom: 16,
    width: '60%',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardButton: {
    height: 36,
    flex: 1,
    borderRadius: 8,
  },
  // Details styles
  details: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
  },
  detailsImage: {
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailsContent: {
    flex: 1,
  },
  detailsTitle: {
    height: 28,
    borderRadius: 4,
    marginBottom: 8,
    width: '75%',
  },
  detailsSubtitle: {
    height: 20,
    borderRadius: 4,
    marginBottom: 20,
    width: '50%',
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsLabel: {
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
    width: 80,
  },
  detailsValue: {
    height: 18,
    borderRadius: 4,
    width: '60%',
  },
  detailsValueLong: {
    height: 18,
    borderRadius: 4,
    width: '90%',
  },
  // Stats styles
  stats: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  statsHeader: {
    marginBottom: 24,
  },
  statsTitle: {
    height: 24,
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
    alignSelf: 'center',
  },
  statsSubtitle: {
    height: 16,
    borderRadius: 4,
    width: '40%',
    alignSelf: 'center',
  },
  statsChart: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsBar: {
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  statsBarFill: {
    width: '100%',
    borderRadius: 4,
  },
  statsFooter: {
    alignItems: 'center',
  },
  statsTotal: {
    height: 32,
    width: 200,
    borderRadius: 8,
  },
});

export default LoadingSkeleton;