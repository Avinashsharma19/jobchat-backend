const Redis = require("ioredis");

let redis;

try {
  redis = new Redis(process.env.REDIS_URL);
  console.log("Redis connected successfully");
} catch (error) {
  console.error("Redis connection error:", error.message);
}

module.exports = redis;
