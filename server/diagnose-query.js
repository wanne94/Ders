const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/predavanja';

async function diagnoseQuery() {
  try {
    console.log('🔍 Connecting to MongoDB for query diagnosis...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Predavanja'
    });
    
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const lecturesCollection = db.collection('lectures');
    
    // 1. Check actual data in collection
    console.log('\n📊 SAMPLE DATA ANALYSIS:');
    console.log('='.repeat(50));
    
    const sampleDocs = await lecturesCollection.find({}).limit(3).toArray();
    console.log(`Total documents: ${await lecturesCollection.countDocuments()}`);
    console.log('\nSample documents:');
    sampleDocs.forEach((doc, i) => {
      console.log(`${i + 1}. Status: "${doc.status}", Date: ${doc.date}, Type: ${typeof doc.date}`);
    });
    
    // 2. Check status field values
    console.log('\n📊 STATUS FIELD ANALYSIS:');
    console.log('='.repeat(50));
    
    const statusCounts = await lecturesCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    console.log('Status distribution:');
    statusCounts.forEach(item => {
      console.log(`  "${item._id}": ${item.count} documents`);
    });
    
    // 3. Check date field values
    console.log('\n📊 DATE FIELD ANALYSIS:');
    console.log('='.repeat(50));
    
    const now = new Date();
    const futureDates = await lecturesCollection.countDocuments({ date: { $gte: now } });
    const pastDates = await lecturesCollection.countDocuments({ date: { $lt: now } });
    
    console.log(`Current time: ${now}`);
    console.log(`Future dates: ${futureDates} documents`);
    console.log(`Past dates: ${pastDates} documents`);
    
    // 4. Test different query variations
    console.log('\n⚡ TESTING DIFFERENT QUERY VARIATIONS:');
    console.log('='.repeat(50));
    
    const testQueries = [
      {
        name: 'Original query',
        query: { status: 'approved', date: { $gte: new Date() } }
      },
      {
        name: 'Status only',
        query: { status: 'approved' }
      },
      {
        name: 'Date only',
        query: { date: { $gte: new Date() } }
      },
      {
        name: 'Status with exact match',
        query: { status: { $eq: 'approved' }, date: { $gte: new Date() } }
      }
    ];
    
    for (const test of testQueries) {
      console.log(`\n🔍 Testing: ${test.name}`);
      console.log(`Query: ${JSON.stringify(test.query)}`);
      
      const explain = await lecturesCollection.find(test.query).explain('executionStats');
      const stats = explain.executionStats;
      
      console.log(`  Execution Time: ${stats.executionTimeMillis}ms`);
      console.log(`  Stage: ${stats.executionStages?.stage || 'UNKNOWN'}`);
      console.log(`  Index Used: ${stats.executionStages?.indexName || 'NONE'}`);
      console.log(`  Docs Examined: ${stats.totalDocsExamined}`);
      console.log(`  Docs Returned: ${stats.totalDocsReturned}`);
      
      // Check if using index
      const usingIndex = stats.executionStages?.stage === 'IXSCAN';
      console.log(`  Using Index: ${usingIndex ? '✅ YES' : '❌ NO'}`);
    }
    
    // 5. Force index usage test
    console.log('\n🔧 FORCING INDEX USAGE TEST:');
    console.log('='.repeat(50));
    
    try {
      const forcedQuery = await lecturesCollection.find({ 
        status: 'approved', 
        date: { $gte: new Date() } 
      }).hint({ status: 1, date: 1 }).explain('executionStats');
      
      console.log('Forced index usage result:');
      console.log(`  Stage: ${forcedQuery.executionStats.executionStages?.stage}`);
      console.log(`  Index: ${forcedQuery.executionStats.executionStages?.indexName}`);
      console.log(`  Time: ${forcedQuery.executionStats.executionTimeMillis}ms`);
      
    } catch (hintError) {
      console.log('❌ Error forcing index:', hintError.message);
    }
    
    // 6. Check index statistics
    console.log('\n📊 INDEX USAGE STATISTICS:');
    console.log('='.repeat(50));
    
    try {
      const indexStats = await lecturesCollection.aggregate([
        { $indexStats: {} }
      ]).toArray();
      
      console.log('Index usage stats:');
      indexStats.forEach(stat => {
        console.log(`  ${stat.name}: ${stat.accesses.ops} operations`);
      });
      
    } catch (statsError) {
      console.log('ℹ️ Index stats not available:', statsError.message);
    }
    
    // 7. Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('='.repeat(50));
    
    const activeCount = statusCounts.find(s => s._id === 'approved')?.count || 0;
    const totalCount = await lecturesCollection.countDocuments();
    
    if (activeCount === 0) {
      console.log('🚨 CRITICAL: No documents with status "approved" found!');
      console.log('   This explains why queries are slow - no matching documents.');
    } else if (activeCount < totalCount * 0.1) {
      console.log('⚠️ WARNING: Very few "approved" documents. Index should be used.');
    } else {
      console.log('ℹ️ INFO: Good number of approved documents. Index should definitely be used.');
    }
    
    if (futureDates === 0) {
      console.log('🚨 CRITICAL: No future dates found!');
      console.log('   All lectures are in the past. This explains the slow query.');
    }
    
    console.log('\n🔧 SUGGESTED FIXES:');
    console.log('1. Check if you have documents with status="approved" AND future dates');
    console.log('2. Try restarting MongoDB connection');
    console.log('3. Consider dropping and recreating indexes');
    console.log('4. Check MongoDB version compatibility');
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

diagnoseQuery(); 