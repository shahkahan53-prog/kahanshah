import os
import json
import time
import logging
from typing import Optional, Any

# Configure logger for Redis caching events
logger = logging.getLogger("redis_cache")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] %(levelname)s: %(message)s", datefmt="%H:%M:%S")
    ch.setFormatter(formatter)
    logger.addHandler(ch)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class RedisCacheManager:
    """
    Manages Redis caching with:
    - 5-minute default TTL (300 seconds)
    - Key invalidation on admin updates
    - Prominent HIT / MISS logging for observability
    - Transparent in-memory fallback if Redis daemon is not running locally
    """
    def __init__(self, redis_url: str = REDIS_URL):
        self.redis_url = redis_url
        self.redis_client = None
        self._memory_cache = {}  # key -> (value, expire_timestamp)
        self._init_client()

    def _init_client(self):
        try:
            import redis
            client = redis.Redis.from_url(
                self.redis_url,
                decode_responses=True,
                socket_connect_timeout=1.0,
                socket_timeout=1.0
            )
            client.ping()
            self.redis_client = client
            logger.info(f"Connected to live Redis server at {self.redis_url}")
        except Exception as e:
            self.redis_client = None
            logger.warning(f"Live Redis not reachable at {self.redis_url} ({e}). Using in-memory fallback with identical TTL & invalidation semantics.")

    def get(self, key: str) -> Optional[Any]:
        """Retrieve item from cache with HIT / MISS logging."""
        # Try live Redis first if available
        if self.redis_client:
            try:
                raw = self.redis_client.get(key)
                if raw is not None:
                    logger.info(f"[REDIS CACHE HIT] Key: '{key}' (retrieved instantly from Redis)")
                    return json.loads(raw)
                else:
                    logger.info(f"[REDIS CACHE MISS] Key: '{key}' (not found in Redis, querying database)")
                    return None
            except Exception as e:
                logger.warning(f"Redis get error on key '{key}': {e}. Falling back to memory cache.")

        # Fallback to in-memory TTL cache
        now = time.time()
        if key in self._memory_cache:
            val, exp = self._memory_cache[key]
            if now < exp:
                logger.info(f"[REDIS CACHE HIT] Key: '{key}' (retrieved from cache, TTL remaining: {int(exp - now)}s)")
                return val
            else:
                del self._memory_cache[key]
                logger.info(f"[REDIS CACHE MISS] Key: '{key}' (cache expired, querying database)")
                return None
        
        logger.info(f"[REDIS CACHE MISS] Key: '{key}' (not in cache, querying database)")
        return None

    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Store item in cache with TTL (default 300s / 5 mins)."""
        if self.redis_client:
            try:
                raw = json.dumps(value)
                self.redis_client.setex(key, ttl, raw)
                logger.info(f"[REDIS CACHE SET] Key: '{key}' with TTL {ttl}s (5 minutes)")
                return True
            except Exception as e:
                logger.warning(f"Redis set error on key '{key}': {e}. Saving in memory fallback.")

        # Save to memory cache
        self._memory_cache[key] = (value, time.time() + ttl)
        logger.info(f"[REDIS CACHE SET] Key: '{key}' stored with TTL {ttl}s (5 minutes)")
        return True

    def delete(self, key: str) -> bool:
        """Invalidate/delete key from cache (called upon admin updates)."""
        invalidated = False
        if self.redis_client:
            try:
                self.redis_client.delete(key)
                invalidated = True
            except Exception as e:
                logger.warning(f"Redis delete error on key '{key}': {e}")

        if key in self._memory_cache:
            del self._memory_cache[key]
            invalidated = True

        logger.info(f"[REDIS CACHE INVALIDATED] Key: '{key}' successfully deleted from cache!")
        return invalidated

    def flush(self):
        """Flush all cached keys."""
        if self.redis_client:
            try:
                self.redis_client.flushdb()
            except Exception:
                pass
        self._memory_cache.clear()
        logger.info("[REDIS CACHE FLUSHED] All cache cleared.")

# Global instance
cache = RedisCacheManager()
