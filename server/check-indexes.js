const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/predavanja';

async function checkIndexes() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'Predavanja'
    });
    
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check lectures collection indexes
    console.log('\n📊 LECTURES COLLECTION INDEXES:');
    console.log('='.repeat(50));
    
    const lecturesCollection = db.collection('lectures');
    const lectureIndexes = await lecturesCollection.indexes();
    
    console.log(`Found ${lectureIndexes.length} indexes:`);
    lectureIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`);
      console.log(`   Keys: ${JSON.stringify(index.key)}`);
      console.log(`   Unique: ${index.unique || false}`);
      console.log(`   Background: ${index.background || false}`);
      console.log('');
    });
    
    // Check if critical indexes exist
    const criticalIndexes = [
      { status: 1, date: 1 },
      { status: 1 },
      { date: 1 },
      { createdBy: 1 }
    ];
    
    console.log('🔍 CHECKING CRITICAL INDEXES:');
    console.log('='.repeat(50));
    
    criticalIndexes.forEach((indexKey, i) => {
      const exists = lectureIndexes.some(index => {
        return JSON.stringify(index.key) === JSON.stringify(indexKey);
      });
      
      console.log(`${i + 1}. ${JSON.stringify(indexKey)}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    });
    
    // Check collection stats
    console.log('\n📊 COLLECTION STATISTICS:');
    console.log('='.repeat(50));
    
    const stats = await lecturesCollection.stats();
    console.log(`Documents: ${stats.count}`);
    console.log(`Data Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Indexes: ${stats.nindexes}`);
    console.log(`Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Average Document Size: ${stats.avgObjSize} bytes`);
    
    // Test query performance with explain
    console.log('\n⚡ QUERY PERFORMANCE TEST:');
    console.log('='.repeat(50));
    
    const testQuery = { status: 'approved', date: { $gte: new Date() } };
    console.log(`Testing query: ${JSON.stringify(testQuery)}`);
    
    const explainResult = await lecturesCollection.find(testQuery).explain('executionStats');
    
    console.log('\n📈 Execution Stats:');
    console.log(`Execution Time: ${explainResult.executionStats.executionTimeMillis}ms`);
    console.log(`Documents Examined: ${explainResult.executionStats.totalDocsExamined}`);
    console.log(`Documents Returned: ${explainResult.executionStats.totalDocsReturned}`);
    console.log(`Index Used: ${explainResult.executionStats.executionStages?.indexName || 'COLLECTION_SCAN'}`);
    console.log(`Stage: ${explainResult.executionStats.executionStages?.stage || 'UNKNOWN'}`);
    
    // Performance analysis
    const isUsingIndex = explainResult.executionStats.executionStages?.stage === 'IXSCAN';
    const isEfficient = explainResult.executionStats.totalDocsExamined <= explainResult.executionStats.totalDocsReturned * 2;
    
    console.log('\n🎯 PERFORMANCE ANALYSIS:');
    console.log('='.repeat(50));
    console.log(`Using Index: ${isUsingIndex ? '✅ YES' : '❌ NO (COLLECTION SCAN)'}`);
    console.log(`Efficient Query: ${isEfficient ? '✅ YES' : '❌ NO (examining too many docs)'}`);
    
    if (!isUsingIndex) {
      console.log('\n🚨 CRITICAL ISSUE: Query is not using indexes!');
      console.log('💡 Solution: Create the missing compound index {status: 1, date: 1}');
    }
    
    if (!isEfficient) {
      console.log('\n⚠️ WARNING: Query is examining too many documents');
      console.log('💡 Solution: Optimize query or add more specific indexes');
    }
    
    // Create missing indexes if needed
    console.log('\n🔧 CREATING MISSING INDEXES:');
    console.log('='.repeat(50));
    
    try {
      // Create critical compound index
      await lecturesCollection.createIndex({ status: 1, date: 1 }, { background: true });
      console.log('✅ Created compound index: {status: 1, date: 1}');
      
      await lecturesCollection.createIndex({ status: 1 }, { background: true });
      console.log('✅ Created index: {status: 1}');
      
      await lecturesCollection.createIndex({ date: 1 }, { background: true });
      console.log('✅ Created index: {date: 1}');
      
      await lecturesCollection.createIndex({ createdBy: 1 }, { background: true });
      console.log('✅ Created index: {createdBy: 1}');
      
      console.log('\n🎉 All critical indexes created successfully!');
      console.log('💡 Please restart your server and test again.');
      
    } catch (indexError) {
      console.log('ℹ️ Some indexes may already exist:', indexError.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkIndexes(); 