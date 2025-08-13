import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import ContentContainer from './ContentContainer';
import predavanjaService from '../services/predavanjaService';

const SimplifiedStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch data for 2025
      const response = await predavanjaService.getStatistics({ year: 2025 });
      
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Greška pri učitavanju statistika');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Učitavanje statistika...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!statistics) {
    return null;
  }

  // Prepare data for the chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
  const chartData = monthNames.map((month, index) => {
    const monthData = statistics.monthlyStats.find(
      stat => stat.month === index + 1 && stat.year === 2025
    );
    return {
      month,
      count: monthData ? monthData.count : 0
    };
  });

  const totalLectures = statistics.summary.totalLectures;

  return (
    <Box sx={{ py: 6, backgroundColor: '#f5f5f5' }}>
      <ContentContainer>
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            sx={{ 
              textAlign: 'center', 
              mb: 4, 
              fontWeight: 'bold' 
            }}
          >
            Statistika predavanja 2025
          </Typography>

          <Box sx={{ width: '100%', height: isMobile ? 250 : 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} predavanja`, '']}
                  labelFormatter={(label) => `${label} 2025`}
                />
                <Bar 
                  dataKey="count" 
                  fill="#1976d2" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Typography 
            variant="h6" 
            sx={{ 
              textAlign: 'center', 
              mt: 4,
              fontWeight: 'bold',
              color: theme.palette.text.primary
            }}
          >
            Ukupno najavljenih predavanja: {totalLectures}
          </Typography>
        </Paper>
      </ContentContainer>
    </Box>
  );
};

export default SimplifiedStatistics;