require("dotenv").config();

const http = require("http");
const app = require("./app");

const { connectDB } = require("./config/db");
const redis = require("./config/redis");
const { initSocket } = require("./config/socket");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

// 🧠 Validate critical env early
if (!process.env.MONGO_URI) {
  logger.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

const server = http.createServer(app);

// 🔌 Socket setup (WebSockets)
initSocket(server);

// 🚀 Start everything
const startServer = async () => {
  try {
    console.log("⚡ Starting server...");

    // 1. MongoDB (BLOCKING)
    await connectDB();
    console.log("✅ MongoDB Connected");

    // 2. Redis (NON-BLOCKING)
    if (redis?.on) {
      redis.on("connect", () => {
        console.log("🔌 Redis connecting...");
      });

      redis.on("ready", () => {
        console.log("⚡ Redis ready");
      });

      redis.on("error", (err) => {
        console.log("❌ Redis error:", err.message);
      });
    } else {
      console.log("⚠️ Redis not initialized (skipping)");
    }

    // 3. Start HTTP + WebSocket server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Socket enabled on same server`);
    });

    // 4. Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`👋 ${signal} received. Shutting down...`);

      server.close(() => {
        logger.info("💤 HTTP server closed");

        // optional: close redis if needed
        if (redis?.quit) {
          redis.quit();
        }

        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();