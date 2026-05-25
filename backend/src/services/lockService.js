const Redis = require("ioredis");

let redis;
let isRedisConnected = false;

// We will try to connect to a local Redis server or REDIS_URL if specified in process.env.
// If it fails, we fall back to a clean in-memory lock.
const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

console.log(`[Redis] Initializing connection to ${redisUrl}...`);

try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 2000,
    retryStrategy(times) {
      // Let it try 3 times initially, then stop to trigger fallback without blocking app start
      if (times > 3) {
        return null;
      }
      return 1000;
    }
  });

  redis.on("connect", () => {
    isRedisConnected = true;
    console.log("✅ [Redis] Connected successfully. Distributed Mutex Locking is ACTIVE.");
  });

  redis.on("error", (err) => {
    if (isRedisConnected) {
      isRedisConnected = false;
      console.warn("⚠️ [Redis] Connection lost. Falling back to in-memory Mutex locks.");
    }
  });
} catch (error) {
  console.warn("⚠️ [Redis] Client initialization failed. Falling back to in-memory Mutex locks.");
}

// Simple in-memory Mutex fallback implementation
const memoryLocks = new Set();
const activeMemoryLocks = new Map(); // key -> { timeoutId, queue: [resolve] }

const acquireMemoryLock = (key, ttl) => {
  return new Promise((resolve) => {
    if (!memoryLocks.has(key)) {
      memoryLocks.add(key);
      
      // Auto-release on TTL to prevent deadlocks
      const timeoutId = setTimeout(() => {
        releaseMemoryLock(key);
      }, ttl);
      
      activeMemoryLocks.set(key, { timeoutId, queue: [] });
      resolve(true);
    } else {
      // Add to queue to resolve once current holder releases the lock
      const lockObj = activeMemoryLocks.get(key);
      if (lockObj) {
        lockObj.queue.push(resolve);
      } else {
        resolve(false);
      }
    }
  });
};

const releaseMemoryLock = (key) => {
  if (memoryLocks.has(key)) {
    const lockObj = activeMemoryLocks.get(key);
    if (lockObj) {
      clearTimeout(lockObj.timeoutId);
      const nextResolve = lockObj.queue.shift();
      if (nextResolve) {
        // Handover lock ownership to the next process in queue
        const timeoutId = setTimeout(() => {
          releaseMemoryLock(key);
        }, 5000); // 5 sec default TTL
        
        activeMemoryLocks.set(key, { timeoutId, queue: lockObj.queue });
        nextResolve(true);
      } else {
        memoryLocks.delete(key);
        activeMemoryLocks.delete(key);
      }
    } else {
      memoryLocks.delete(key);
    }
  }
};

/**
 * Acquire a distributed lock.
 * @param {string} key - Lock key identifier (e.g. `lock:item:<id>`)
 * @param {number} ttl - Lock Time-To-Live in milliseconds
 * @param {number} retries - Number of acquisition retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise<string|boolean>} - Returns a unique token string if lock acquired, or false
 */
const acquireLock = async (key, ttl = 5000, retries = 5, delay = 200) => {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

  for (let i = 0; i <= retries; i++) {
    try {
      if (isRedisConnected && redis) {
        // Redlock pattern: set key with PX (ttl) and NX (only if not exists)
        const result = await redis.set(key, token, "NX", "PX", ttl);
        if (result === "OK") {
          return token;
        }
      } else {
        // In-memory Mutex fallback
        const acquired = await acquireMemoryLock(key, ttl);
        if (acquired) {
          return token; 
        }
      }
    } catch (err) {
      console.error(`[LockManager] Error acquiring lock for key ${key}:`, err.message);
    }

    if (i < retries) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return false;
};

/**
 * Release a lock securely.
 * @param {string} key - Lock key identifier
 * @param {string} token - Unique token matching the lock owner
 * @returns {Promise<boolean>}
 */
const releaseLock = async (key, token) => {
  try {
    if (isRedisConnected && redis) {
      // Lua script ensures atomic release only if the token matches the lock holder
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      const result = await redis.eval(script, 1, key, token);
      return result === 1;
    } else {
      releaseMemoryLock(key);
      return true;
    }
  } catch (err) {
    console.error(`[LockManager] Error releasing lock for key ${key}:`, err.message);
    return false;
  }
};

module.exports = {
  acquireLock,
  releaseLock,
  isRedisConnected: () => isRedisConnected,
};
