import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonLoader from './SkeletonLoader';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - 40;

const COLORS = {
  white: '#ffffff',
  lightGray: '#f5f5f5',
};

const SkeletonCard = ({ type = 'lecture', style }) => {
  const renderSkeletonContent = () => {
    switch (type) {
      case 'lecture':
        return (
          <>
            {/* Title */}
            <SkeletonLoader width="80%" height={20} style={styles.title} />
            
            {/* Speaker/Daija */}
            <View style={styles.row}>
              <SkeletonLoader width={20} height={20} variant="circle" />
              <SkeletonLoader width="60%" height={14} style={styles.rowText} />
            </View>
            
            {/* Organization */}
            <View style={styles.row}>
              <SkeletonLoader width={20} height={20} variant="circle" />
              <SkeletonLoader width="50%" height={14} style={styles.rowText} />
            </View>
            
            {/* Date */}
            <View style={styles.row}>
              <SkeletonLoader width={20} height={20} variant="circle" />
              <SkeletonLoader width="45%" height={14} style={styles.rowText} />
            </View>
            
            {/* Time */}
            <View style={styles.row}>
              <SkeletonLoader width={20} height={20} variant="circle" />
              <SkeletonLoader width="30%" height={14} style={styles.rowText} />
            </View>
          </>
        );
        
      case 'daija':
        return (
          <>
            {/* Name/Title */}
            <SkeletonLoader width="70%" height={20} style={styles.title} />
            
            {/* Description */}
            <View style={styles.row}>
              <SkeletonLoader width={20} height={20} variant="circle" />
              <SkeletonLoader width="80%" height={14} style={styles.rowText} />
            </View>
            
            {/* Lecture count */}
            <View style={styles.row}>
              <SkeletonLoader width={20} height={20} variant="circle" />
              <SkeletonLoader width="40%" height={14} style={styles.rowText} />
            </View>
          </>
        );
        
      case 'organization':
        return (
          <>
            {/* Name */}
            <SkeletonLoader width="75%" height={20} style={styles.title} />
            
            {/* Address */}
            <View style={styles.row}>
              <SkeletonLoader width={20} height={20} variant="circle" />
              <SkeletonLoader width="65%" height={14} style={styles.rowText} />
            </View>
            
            {/* City */}
            <View style={styles.row}>
              <SkeletonLoader width={20} height={20} variant="circle" />
              <SkeletonLoader width="40%" height={14} style={styles.rowText} />
            </View>
            
            {/* Description */}
            <View style={styles.row}>
              <SkeletonLoader width={20} height={20} variant="circle" />
              <SkeletonLoader width="70%" height={14} style={styles.rowText} />
            </View>
          </>
        );
        
      default:
        return (
          <>
            <SkeletonLoader width="70%" height={20} style={styles.title} />
            <View style={styles.row}>
              <SkeletonLoader width={20} height={20} variant="circle" />
              <SkeletonLoader width="60%" height={14} style={styles.rowText} />
            </View>
            <View style={styles.row}>
              <SkeletonLoader width={20} height={20} variant="circle" />
              <SkeletonLoader width="50%" height={14} style={styles.rowText} />
            </View>
          </>
        );
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderSkeletonContent()}
    </View>
  );
};

const SkeletonCardList = ({ count = 3, type = 'lecture', style }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard 
          key={index} 
          type={type} 
          style={[style, index > 0 && styles.cardSpacing]} 
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowText: {
    marginLeft: 12,
  },
  cardSpacing: {
    marginTop: 12,
  },
});

export { SkeletonCard, SkeletonCardList };
export default SkeletonCardList;