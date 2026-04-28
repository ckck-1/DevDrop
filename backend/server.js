require('dotenv').config(); // Ensure this is at the top
const app = require('./app');
const { connectDB } = require('./config/db');
const redis = require('./config/redis'); // Import the instance directly
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Check if redis is ready
    if (redis.status !== 'ready') {
      await new Promise((resolve) => redis.once('ready', resolve));
    }
    
    // START EXPRESS LAST
    app.listen(PORT, () => {
      console.log(`✅ MongoDB Connected`);
      console.log(`✅ Redis Pipeline Verified`);
      console.log(`🚀 Backend Scaled & Ready on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();