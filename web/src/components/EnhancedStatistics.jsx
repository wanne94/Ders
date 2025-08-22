import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import ContentContainer from './ContentContainer';
import predavanjaService from '../services/predavanjaService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

const EnhancedStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(2025);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchStatistics();
  }, [selectedYear]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await predavanjaService.getStatistics({ year: selectedYear });
      
      if (response.success) {
        // Process city distribution
        const cityData = processCityData(response.data);
        const speakerData = processSpeakerData(response.data);
        
        setStatistics({
          ...response.data,
          cityDistribution: cityData,
          speakerDistribution: speakerData
        });
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Greška pri učitavanju statistika');
    } finally {
      setIsLoading(false);
    }
  };

  const processCityData = (data) => {
    const cityCount = {};
    
    // Count lectures by city
    if (data.lectures) {
      data.lectures.forEach(lecture => {
        if (lecture.city) {
          cityCount[lecture.city] = (cityCount[lecture.city] || 0) + 1;
        }
      });
    }
    
    // Convert to array and sort by count
    return Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 cities
  };

  const processSpeakerData = (data) => {
    const speakerCount = {};
    
    // Count lectures by speaker
    if (data.lectures) {
      data.lectures.forEach(lecture => {
        if (lecture.speaker) {
          speakerCount[lecture.speaker] = (speakerCount[lecture.speaker] || 0) + 1;
        }
      });
    }
    
    // Convert to array and sort by count
    return Object.entries(speakerCount)
      .map(([speaker, count]) => ({ speaker, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 speakers
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

  // Prepare data for charts
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'];
  const monthlyData = monthNames.map((month, index) => {
    const monthData = statistics.monthlyStats.find(
      stat => stat.month === index + 1 && stat.year === selectedYear
    );
    return {
      month,
      count: monthData ? monthData.count : 0,
      approvedCount: monthData ? monthData.approvedCount : 0
    };
  });

  // Calculate cumulative data for trend line
  let cumulative = 0;
  const cumulativeData = monthlyData.map(item => {
    cumulative += item.count;
    return { ...item, cumulative };
  });

  const totalLectures = statistics.summary.totalLectures;
  const averagePerMonth = (totalLectures / 12).toFixed(1);
  const mostActiveMonth = monthlyData.reduce((max, curr) => 
    curr.count > max.count ? curr : max, monthlyData[0]);

  // Stats cards data
  const statsCards = [
    {
      title: 'Ukupno predavanja',
      value: totalLectures,
      icon: <CalendarMonthIcon />,
      color: '#0088FE'
    },
    {
      title: 'Prosjek mjesečno',
      value: averagePerMonth,
      icon: <TrendingUpIcon />,
      color: '#00C49F'
    },
    {
      title: 'Najaktivniji mjesec',
      value: mostActiveMonth.month,
      subtitle: `${mostActiveMonth.count} predavanja`,
      icon: <CalendarMonthIcon />,
      color: '#FFBB28'
    },
    {
      title: 'Broj gradova',
      value: statistics.cityDistribution?.length || 0,
      icon: <LocationCityIcon />,
      color: '#FF8042'
    }
  ];

  return (
    <Box sx={{ py: 6, backgroundColor: '#f5f5f5' }}>
      <ContentContainer>
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            textAlign: 'center', 
            mb: 4, 
            fontWeight: 'bold' 
          }}
        >
          Statistika predavanja za {selectedYear}. godinu
        </Typography>

        {/* Year selector */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <ToggleButtonGroup
            value={selectedYear}
            exclusive
            onChange={(e, newYear) => newYear && setSelectedYear(newYear)}
            size="small"
          >
            <ToggleButton value={2024}>2024</ToggleButton>
            <ToggleButton value={2025}>2025</ToggleButton>
            <ToggleButton value={2026}>2026</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      backgroundColor: card.color + '20',
                      color: card.color,
                      mr: 2
                    }}>
                      {card.icon}
                    </Box>
                    <Typography color="text.secondary" variant="body2">
                      {card.title}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {card.value}
                  </Typography>
                  {card.subtitle && (
                    <Typography variant="caption" color="text.secondary">
                      {card.subtitle}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* View mode selector */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="monthly">Mjesečni prikaz</ToggleButton>
            <ToggleButton value="trend">Trend</ToggleButton>
            <ToggleButton value="cities">Po gradovima</ToggleButton>
            <ToggleButton value="speakers">Po predavačima</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Charts */}
        <Grid container spacing={3}>
          {viewMode === 'monthly' && (
            <>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Broj predavanja po mjesecima
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0088FE" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </>
          )}

          {viewMode === 'trend' && (
            <>
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Kumulativni trend predavanja
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={cumulativeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="cumulative" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </>
          )}

          {viewMode === 'cities' && statistics.cityDistribution && (
            <>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Distribucija po gradovima
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statistics.cityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ city, percent }) => `${city} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {statistics.cityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Top gradovi po broju predavanja
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statistics.cityDistribution} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="city" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </>
          )}

          {viewMode === 'speakers' && statistics.speakerDistribution && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top 10 predavača po broju predavanja
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={statistics.speakerDistribution} margin={{ left: 150 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="speaker" 
                      type="category" 
                      width={140}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Additional insights */}
        <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Dodatni uvidi
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  Najaktivniji predavač: {' '}
                  <Chip 
                    label={statistics.speakerDistribution?.[0]?.speaker || 'N/A'} 
                    size="small" 
                    color="primary"
                  />
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationCityIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  Najaktivniji grad: {' '}
                  <Chip 
                    label={statistics.cityDistribution?.[0]?.city || 'N/A'} 
                    size="small" 
                    color="secondary"
                  />
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  Rast u odnosu na prošlu godinu: {' '}
                  <Chip 
                    label="+15%" 
                    size="small" 
                    color="success"
                  />
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </ContentContainer>
    </Box>
  );
};

export default EnhancedStatistics;