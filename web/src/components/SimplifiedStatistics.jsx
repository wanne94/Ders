import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

const SimplifiedStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="text-center py-16">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#022C43]" />
        <p className="mt-4 text-gray-600">Učitavanje statistika...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
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
    <div className="py-12 bg-gray-50">
      <ContentContainer>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Statistika predavanja 2025
          </h2>

          <div className="w-full h-64 sm:h-80">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  className="text-xs sm:text-sm"
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  className="text-xs sm:text-sm"
                />
                <Tooltip 
                  formatter={(value) => [`${value} predavanja`, '']}
                  labelFormatter={(label) => `${label} 2025`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '8px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#022C43" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 className="text-xl font-bold text-center mt-8 text-gray-900">
            Ukupno najavljenih predavanja: {totalLectures}
          </h3>
        </div>
      </ContentContainer>
    </div>
  );
};

export default SimplifiedStatistics;