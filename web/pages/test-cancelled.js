import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import PageLayout from '@/components/PageLayout';

const TestCancelledPage = () => {
  const [data, setData] = useState({
    loading: true,
    allLectures: [],
    cancelledLectures: [],
    diskriminacijaLecture: null,
    error: null
  });

  const fetchData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // Call the API
      const response = await fetch('http://localhost:5003/api/lectures/public?status=all');
      const lectures = await response.json();
      
      console.log('📊 Total lectures received:', lectures.length);
      
      // Find cancelled lectures
      const cancelled = lectures.filter(l => 
        l.status === 'cancelled' || 
        l.status === 'canceled' || 
        l.isCancelled === true
      );
      
      console.log('❌ Cancelled lectures found:', cancelled.length);
      
      // Find Diskriminacija lecture
      const diskriminacija = lectures.find(l => 
        l.title && l.title.toLowerCase().includes('diskriminacija')
      );
      
      setData({
        loading: false,
        allLectures: lectures,
        cancelledLectures: cancelled,
        diskriminacijaLecture: diskriminacija,
        error: null
      });
      
    } catch (error) {
      console.error('Error:', error);
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Test Otkazanih Predavanja
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={fetchData} 
          sx={{ mb: 3 }}
        >
          Refresh Data
        </Button>

        {data.loading && (
          <Alert severity="info">Loading...</Alert>
        )}

        {data.error && (
          <Alert severity="error">Error: {data.error}</Alert>
        )}

        {!data.loading && !data.error && (
          <>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">API Response Summary:</Typography>
              <Typography>Total lectures: {data.allLectures.length}</Typography>
              <Typography>Cancelled lectures: {data.cancelledLectures.length}</Typography>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">Diskriminacija Lecture Status:</Typography>
              {data.diskriminacijaLecture ? (
                <>
                  <Typography>✅ Found!</Typography>
                  <Typography>Title: {data.diskriminacijaLecture.title}</Typography>
                  <Typography>Status: {data.diskriminacijaLecture.status}</Typography>
                  <Typography>Is Cancelled: {data.diskriminacijaLecture.isCancelled ? 'YES' : 'NO'}</Typography>
                  <Typography>Date: {data.diskriminacijaLecture.date}</Typography>
                  <Typography>Speaker: {data.diskriminacijaLecture.speaker}</Typography>
                </>
              ) : (
                <Typography color="error">❌ NOT FOUND in API response!</Typography>
              )}
            </Paper>

            {data.cancelledLectures.length > 0 && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">All Cancelled Lectures:</Typography>
                {data.cancelledLectures.map((lecture, index) => (
                  <Box key={lecture._id} sx={{ mb: 1, p: 1, bgcolor: 'grey.100' }}>
                    <Typography><strong>{index + 1}. {lecture.title}</strong></Typography>
                    <Typography variant="body2">Status: {lecture.status}</Typography>
                    <Typography variant="body2">Is Cancelled: {lecture.isCancelled ? 'YES' : 'NO'}</Typography>
                  </Box>
                ))}
              </Paper>
            )}

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Raw JSON (first 3 lectures):</Typography>
              <pre style={{ overflow: 'auto', fontSize: '12px' }}>
                {JSON.stringify(data.allLectures.slice(0, 3), null, 2)}
              </pre>
            </Paper>
          </>
        )}
      </Box>
    </PageLayout>
  );
};

export default TestCancelledPage;