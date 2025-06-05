const axios = require('axios');

// 🚀 Performance Test Script
const BASE_URL = 'http://localhost:5003';

async function testPerformance() {
  console.log('🧪 Starting performance tests...');
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthStart = Date.now();
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    const healthDuration = Date.now() - healthStart;
    console.log(`✅ Health check: ${healthDuration}ms - ${healthResponse.data.status}`);
    console.log(`📊 Database: ${healthResponse.data.database}`);
    
    // Test 2: Original public lectures endpoint
    console.log('\n2️⃣ Testing ORIGINAL public lectures endpoint...');
    const lecturesStart = Date.now();
    const lecturesResponse = await axios.get(`${BASE_URL}/api/lectures/public`);
    const lecturesDuration = Date.now() - lecturesStart;
    
    console.log(`✅ Original public lectures: ${lecturesDuration}ms`);
    console.log(`📊 Found ${lecturesResponse.data.length} lectures`);
    console.log(`🎯 Performance grade: ${lecturesResponse.headers['x-performance-grade'] || 'N/A'}`);
    console.log(`⚡ Query time: ${lecturesResponse.headers['x-query-time'] || 'N/A'}`);
    console.log(`🔄 Transform time: ${lecturesResponse.headers['x-transform-time'] || 'N/A'}`);
    console.log(`🚀 Optimized: ${lecturesResponse.headers['x-optimized'] || 'N/A'}`);
    console.log(`🔍 Index hint: ${lecturesResponse.headers['x-index-hint'] || 'N/A'}`);
    
    // Test 3: NEW aggregation endpoint
    console.log('\n3️⃣ Testing NEW aggregation endpoint...');
    const aggStart = Date.now();
    const aggResponse = await axios.get(`${BASE_URL}/api/lectures/public-fast`);
    const aggDuration = Date.now() - aggStart;
    
    console.log(`✅ Aggregation endpoint: ${aggDuration}ms`);
    console.log(`📊 Found ${aggResponse.data.length} lectures`);
    console.log(`🎯 Performance grade: ${aggResponse.headers['x-performance-grade'] || 'N/A'}`);
    console.log(`⚡ Query time: ${aggResponse.headers['x-query-time'] || 'N/A'}`);
    console.log(`🔄 Transform time: ${aggResponse.headers['x-transform-time'] || 'N/A'}`);
    console.log(`🚀 Method: ${aggResponse.headers['x-method'] || 'N/A'}`);
    console.log(`🔍 Index hint: ${aggResponse.headers['x-index-hint'] || 'N/A'}`);
    
    // Test 4: Performance test endpoint
    console.log('\n4️⃣ Running comprehensive performance test...');
    const perfTestStart = Date.now();
    const perfResponse = await axios.get(`${BASE_URL}/api/performance-test`);
    const perfTestDuration = Date.now() - perfTestStart;
    
    console.log(`✅ Performance test completed: ${perfTestDuration}ms`);
    console.log('📊 Results:');
    console.log(`  - DB Ping: ${perfResponse.data.results.dbPing}ms`);
    console.log(`  - Simple Find: ${perfResponse.data.results.simpleFind.duration}ms`);
    console.log(`  - Complex Query: ${perfResponse.data.results.complexQuery.duration}ms`);
    console.log(`  - Optimized Query: ${perfResponse.data.results.optimizedQuery.duration}ms`);
    console.log(`  - Populate Query: ${perfResponse.data.results.populateQuery.duration}ms`);
    console.log(`  - Data Transform: ${perfResponse.data.results.dataTransform.duration}ms`);
    console.log(`  - Optimized Transform: ${perfResponse.data.results.optimizedDataTransform.duration}ms`);
    
    if (perfResponse.data.improvements) {
      console.log('\n🚀 Performance Improvements:');
      console.log(`  - Query improvement: ${perfResponse.data.improvements.queryImprovement}ms`);
      console.log(`  - Transform improvement: ${perfResponse.data.improvements.transformImprovement}ms`);
      console.log(`  - Total improvement: ${perfResponse.data.improvements.totalImprovement}ms`);
      console.log(`  - Percentage improvement: ${perfResponse.data.improvements.percentageImprovement}`);
    }
    
    console.log('\n📈 Analysis:');
    console.log(`  - DB Connection: ${perfResponse.data.analysis.dbConnectionHealth}`);
    console.log(`  - Query Performance: ${perfResponse.data.analysis.queryPerformance}`);
    console.log(`  - Recommendations: ${perfResponse.data.analysis.recommendations.length}`);
    
    if (perfResponse.data.analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      perfResponse.data.analysis.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    // Test 5: Multiple concurrent requests (both endpoints)
    console.log('\n5️⃣ Testing concurrent requests...');
    
    // Test original endpoint
    const concurrentStart = Date.now();
    const concurrentPromises = Array(5).fill().map(() => 
      axios.get(`${BASE_URL}/api/lectures/public`)
    );
    
    const concurrentResults = await Promise.all(concurrentPromises);
    const concurrentDuration = Date.now() - concurrentStart;
    const avgDuration = concurrentDuration / 5;
    
    console.log(`✅ 5 concurrent requests (original): ${concurrentDuration}ms total, ${avgDuration.toFixed(1)}ms average`);
    
    // Test aggregation endpoint
    const concurrentAggStart = Date.now();
    const concurrentAggPromises = Array(5).fill().map(() => 
      axios.get(`${BASE_URL}/api/lectures/public-fast`)
    );
    
    const concurrentAggResults = await Promise.all(concurrentAggPromises);
    const concurrentAggDuration = Date.now() - concurrentAggStart;
    const avgAggDuration = concurrentAggDuration / 5;
    
    console.log(`✅ 5 concurrent requests (aggregation): ${concurrentAggDuration}ms total, ${avgAggDuration.toFixed(1)}ms average`);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 PERFORMANCE SUMMARY:');
    console.log('='.repeat(50));
    console.log(`🏥 Health Check: ${healthDuration}ms`);
    console.log(`📚 Original Lectures: ${lecturesDuration}ms`);
    console.log(`⚡ Aggregation Lectures: ${aggDuration}ms`);
    console.log(`🧪 Performance Test: ${perfTestDuration}ms`);
    console.log(`🔄 Concurrent Original: ${avgDuration.toFixed(1)}ms average`);
    console.log(`🔄 Concurrent Aggregation: ${avgAggDuration.toFixed(1)}ms average`);
    
    // Performance comparison
    const improvement = lecturesDuration - aggDuration;
    const improvementPercent = ((improvement / lecturesDuration) * 100).toFixed(1);
    
    console.log('\n🚀 OPTIMIZATION RESULTS:');
    console.log('='.repeat(50));
    console.log(`📈 Speed improvement: ${improvement}ms (${improvementPercent}% faster)`);
    console.log(`🏆 Best method: ${aggDuration < lecturesDuration ? 'Aggregation' : 'Original'}`);
    
    // Performance grades
    const grades = {
      health: healthDuration < 50 ? 'EXCELLENT' : healthDuration < 100 ? 'GOOD' : 'SLOW',
      original: lecturesDuration < 50 ? 'EXCELLENT' : lecturesDuration < 100 ? 'GOOD' : lecturesDuration < 300 ? 'MODERATE' : 'SLOW',
      aggregation: aggDuration < 25 ? 'EXCELLENT' : aggDuration < 50 ? 'VERY_GOOD' : aggDuration < 100 ? 'GOOD' : 'SLOW',
      concurrent: avgAggDuration < 50 ? 'EXCELLENT' : avgAggDuration < 150 ? 'GOOD' : 'SLOW'
    };
    
    console.log('\n🎯 PERFORMANCE GRADES:');
    console.log(`  Health: ${grades.health}`);
    console.log(`  Original Lectures: ${grades.original}`);
    console.log(`  Aggregation Lectures: ${grades.aggregation}`);
    console.log(`  Concurrent Performance: ${grades.concurrent}`);
    
    const overallGrade = grades.aggregation === 'EXCELLENT' && grades.concurrent === 'EXCELLENT' ? 'EXCELLENT' :
                        grades.aggregation !== 'SLOW' && grades.concurrent !== 'SLOW' ? 'GOOD' : 'NEEDS_IMPROVEMENT';
    
    console.log(`\n🏆 OVERALL GRADE: ${overallGrade}`);
    
    if (overallGrade === 'EXCELLENT') {
      console.log('🎉 Congratulations! Your database optimizations are working excellently!');
      console.log('💡 Recommendation: Use the aggregation endpoint (/api/lectures/public-fast) for best performance.');
    } else if (overallGrade === 'GOOD') {
      console.log('👍 Good performance! The optimizations are working well.');
      console.log('💡 Recommendation: Consider using the aggregation endpoint for even better performance.');
    } else {
      console.log('⚠️ Performance still needs improvement. Check the recommendations above.');
    }
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Server is not running. Please start the server first with: npm start');
    }
  }
}

// Run the test
testPerformance(); 