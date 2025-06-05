require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('./models/Settings');

async function checkSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/predavanje');
    console.log('Connected to MongoDB');
    
    const settings = await Settings.findOne({ key: 'approvalSettings' });
    console.log('Approval settings:', settings);
    
    if (!settings) {
      console.log('No approval settings found, creating default...');
      const defaultSettings = new Settings({
        key: 'approvalSettings',
        value: {
          lecture: true,
          daija: true,
          organization: true
        },
        description: 'Default approval settings'
      });
      await defaultSettings.save();
      console.log('Default settings created');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSettings(); 