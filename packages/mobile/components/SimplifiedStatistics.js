import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import LoadingSkeleton from './LoadingSkeleton';
import { useAppData } from '../context/AppDataContext';

const { width } = Dimensions.get('window');
const BAR_WIDTH = (width - 60) / 12; // 12 months, with padding

const COLORS = {
  primary: '#022C43',
  primaryLight: '#055A87',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  barColor: '#1976d2',
  background: '#fafafa'
};

const SimplifiedStatistics = () => {
  const { lectures, loading, error } = useAppData();

  const statistics = useMemo(() => {
    if (!Array.isArray(lectures) || lectures.length === 0) {
      return null;
    }

    const monthlyStats = {};
    let totalCount = 0;

    lectures.forEach(lecture => {
      if (!lecture?.date || lecture.status !== 'approved') {
        return;
      }

      const date = new Date(lecture.date);
      if (Number.isNaN(date.getTime()) || date.getFullYear() !== 2025) {
        return;
      }

      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      if (!monthlyStats[key]) {
        monthlyStats[key] = {
          year,
          month,
          count: 0
        };
      }

      monthlyStats[key].count += 1;
      totalCount += 1;
    });

    if (totalCount === 0) {
      return null;
    }

    return {
      summary: {
        totalLectures: totalCount
      },
      monthlyStats: Object.values(monthlyStats)
    };
  }, [lectures]);

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSkeleton type="stats" count={1} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!statistics) {
    return null;
  }

  // Prepare data for the chart - using numbers instead of letters
  const monthNames = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const monthFullNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
  
  // Find max value for scaling
  const maxCount = Math.max(...statistics.monthlyStats.map(stat => stat.count), 1);
  
  const chartData = monthNames.map((month, index) => {
    const monthData = statistics.monthlyStats.find(
      stat => stat.month === index + 1 && stat.year === 2025
    );
    return {
      month,
      fullMonth: monthFullNames[index],
      count: monthData ? monthData.count : 0,
      height: monthData ? (monthData.count / maxCount) * 120 : 0
    };
  });

  const totalLectures = statistics.summary.totalLectures;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Statistika predavanja 2025</Text>
        <Text style={styles.subtitle}>Mjesečno</Text>
        
        {/* Chart Container */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartContainer}
        >
          <View style={styles.chart}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              <Text style={styles.yAxisLabel}>{maxCount}</Text>
              <Text style={styles.yAxisLabel}>{Math.round(maxCount * 0.75)}</Text>
              <Text style={styles.yAxisLabel}>{Math.round(maxCount * 0.5)}</Text>
              <Text style={styles.yAxisLabel}>{Math.round(maxCount * 0.25)}</Text>
              <Text style={styles.yAxisLabel}>0</Text>
            </View>
            
            {/* Bars */}
            <View style={styles.barsContainer}>
              {chartData.map((data, index) => (
                <View key={index} style={styles.barWrapper}>
                  <View style={styles.barContainer}>
                    {data.count > 0 && (
                      <Text style={styles.barValue}>{data.count}</Text>
                    )}
                    <View 
                      style={[
                        styles.bar, 
                        { height: data.height || 2 }
                      ]} 
                    />
                  </View>
                  <Text style={styles.monthLabel}>{data.month}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Total Count */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Ukupno najavljenih predavanja</Text>
          <Text style={styles.totalCount}>{totalLectures}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.gray,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 15,
    borderRadius: 8,
  },
  errorText: {
    color: '#c00',
    textAlign: 'center',
    fontSize: 14,
  },
  chartContainer: {
    paddingBottom: 10,
  },
  chart: {
    flexDirection: 'row',
    height: 150,
    marginBottom: 10,
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    marginRight: 5,
  },
  yAxisLabel: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: 'right',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    paddingLeft: 5,
  },
  barWrapper: {
    width: BAR_WIDTH,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: BAR_WIDTH - 4,
    backgroundColor: COLORS.barColor,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    minHeight: 2,
  },
  barValue: {
    fontSize: 9,
    color: COLORS.gray,
    marginBottom: 2,
  },
  monthLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 5,
  },
  totalContainer: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 5,
    fontWeight: '600',
  },
  totalCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default SimplifiedStatistics;
