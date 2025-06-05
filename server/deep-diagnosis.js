const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/predavanja';

async function deepDiagnosis() {
  try {
    console.log('🔍 Starting deep MongoDB diagnosis...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Predavanja'
    });
    
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const lecturesCollection = db.collection('lectures');
    
    // 1. Check MongoDB version and server info
    console.log('\n🔧 MONGODB SERVER INFO:');
    console.log('='.repeat(50));
    
    const serverStatus = await db.admin().serverStatus();
    console.log(`MongoDB Version: ${serverStatus.version}`);
    console.log(`Host: ${serverStatus.host}`);
    console.log(`Uptime: ${Math.floor(serverStatus.uptime / 3600)} hours`);
    console.log(`Connections: ${serverStatus.connections.current}/${serverStatus.connections.available}`);
    
    // 2. Check collection stats
    console.log('\n📊 COLLECTION DETAILED STATS:');
    console.log('='.repeat(50));
    
    const stats = await lecturesCollection.stats();
    console.log(`Documents: ${stats.count}`);
    console.log(`Data Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Indexes: ${stats.nindexes}`);
    console.log(`Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Average Document Size: ${stats.avgObjSize} bytes`);
    console.log(`Capped: ${stats.capped || false}`);
    
    // 3. Test simple query performance
    console.log('\n⚡ SIMPLE QUERY PERFORMANCE:');
    console.log('='.repeat(50));
    
    const simpleStart = Date.now();
    const simpleCount = await lecturesCollection.countDocuments();
    const simpleTime = Date.now() - simpleStart;
    console.log(`Simple count query: ${simpleTime}ms (${simpleCount} documents)`);
    
    // 4. Test the exact problematic query
    console.log('\n🔍 PROBLEMATIC QUERY ANALYSIS:');
    console.log('='.repeat(50));
    
    const testQuery = { status: 'approved', date: { $gte: new Date() } };
    console.log(`Query: ${JSON.stringify(testQuery)}`);
    
    // Test with explain
    const explainStart = Date.now();
    const explainResult = await lecturesCollection.find(testQuery).explain('executionStats');
    const explainTime = Date.now() - explainStart;
    
    console.log(`\nExplain query time: ${explainTime}ms`);
    console.log(`Execution time: ${explainResult.executionStats.executionTimeMillis}ms`);
    console.log(`Stage: ${explainResult.executionStats.executionStages?.stage}`);
    console.log(`Index used: ${explainResult.executionStats.executionStages?.indexName || 'NONE'}`);
    console.log(`Docs examined: ${explainResult.executionStats.totalDocsExamined}`);
    console.log(`Docs returned: ${explainResult.executionStats.totalDocsReturned}`);
    
    // 5. Test actual query execution
    console.log('\n🚀 ACTUAL QUERY EXECUTION:');
    console.log('='.repeat(50));
    
    const actualStart = Date.now();
    const actualResults = await lecturesCollection.find(testQuery).toArray();
    const actualTime = Date.now() - actualStart;
    
    console.log(`Actual query time: ${actualTime}ms`);
    console.log(`Results count: ${actualResults.length}`);
    
    // 6. Test with hint
    console.log('\n🔧 QUERY WITH FORCED INDEX:');
    console.log('='.repeat(50));
    
    const hintStart = Date.now();
    const hintResults = await lecturesCollection.find(testQuery).hint({ status: 1, date: 1 }).toArray();
    const hintTime = Date.now() - hintStart;
    
    console.log(`Hint query time: ${hintTime}ms`);
    console.log(`Results count: ${hintResults.length}`);
    
    // 7. Test different query approaches
    console.log('\n🧪 DIFFERENT QUERY APPROACHES:');
    console.log('='.repeat(50));
    
    // Approach 1: Status first
    const status1Start = Date.now();
    const status1Results = await lecturesCollection.find({ status: 'approved' }).toArray();
    const status1Time = Date.now() - status1Start;
    console.log(`Status only query: ${status1Time}ms (${status1Results.length} results)`);
    
    // Approach 2: Date first
    const date1Start = Date.now();
    const date1Results = await lecturesCollection.find({ date: { $gte: new Date() } }).toArray();
    const date1Time = Date.now() - date1Start;
    console.log(`Date only query: ${date1Time}ms (${date1Results.length} results)`);
    
    // Approach 3: Aggregation
    const aggStart = Date.now();
    const aggResults = await lecturesCollection.aggregate([
      { $match: testQuery },
      { $sort: { date: 1 } }
    ]).toArray();
    const aggTime = Date.now() - aggStart;
    console.log(`Aggregation query: ${aggTime}ms (${aggResults.length} results)`);
    
    // 8. Check for potential issues
    console.log('\n🔍 POTENTIAL ISSUES ANALYSIS:');
    console.log('='.repeat(50));
    
    // Check for large documents
    const sampleDoc = await lecturesCollection.findOne();
    const docSize = JSON.stringify(sampleDoc).length;
    console.log(`Sample document size: ${docSize} bytes`);
    
    if (docSize > 50000) {
      console.log('⚠️ WARNING: Documents are very large!');
    }
    
    // Check for network latency
    const pingStart = Date.now();
    await db.admin().ping();
    const pingTime = Date.now() - pingStart;
    console.log(`Database ping: ${pingTime}ms`);
    
    if (pingTime > 100) {
      console.log('⚠️ WARNING: High network latency detected!');
    }
    
    // Check for connection issues
    const connInfo = mongoose.connection;
    console.log(`Connection state: ${connInfo.readyState}`);
    console.log(`Connection host: ${connInfo.host}`);
    console.log(`Connection port: ${connInfo.port}`);
    
    // 9. Recommendations
    console.log('\n💡 DIAGNOSIS RESULTS:');
    console.log('='.repeat(50));
    
    if (actualTime > 1000) {
      console.log('🚨 CRITICAL: Query is extremely slow!');
      
      if (pingTime > 100) {
        console.log('   → Likely cause: Network latency');
        console.log('   → Solution: Check internet connection or use local MongoDB');
      } else if (docSize > 50000) {
        console.log('   → Likely cause: Large documents');
        console.log('   → Solution: Use projection to select only needed fields');
      } else if (explainResult.executionStats.executionStages?.stage !== 'IXSCAN') {
        console.log('   → Likely cause: Not using indexes');
        console.log('   → Solution: Force index usage or recreate indexes');
      } else {
        console.log('   → Likely cause: MongoDB Atlas performance tier');
        console.log('   → Solution: Upgrade MongoDB Atlas cluster or use local MongoDB');
      }
    }
    
    console.log('\n🔧 IMMEDIATE ACTIONS:');
    console.log('1. Check MongoDB Atlas cluster performance tier');
    console.log('2. Consider using local MongoDB for development');
    console.log('3. Use projection to reduce data transfer');
    console.log('4. Implement caching for frequently accessed data');
    
  } catch (error) {
    console.error('❌ Error during deep diagnosis:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

deepDiagnosis(); 