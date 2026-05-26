import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

let isConnected = false;

export async function getRedisClient() {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
  }
  return redisClient;
}

// Cache helper functions
export async function cacheSet(key: string, value: any, ttl: number = 3600) {
  const client = await getRedisClient();
  await client.setEx(key, ttl, JSON.stringify(value));
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = await getRedisClient();
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

export async function cacheDel(key: string) {
  const client = await getRedisClient();
  await client.del(key);
}

export async function cacheExists(key: string): Promise<boolean> {
  const client = await getRedisClient();
  return (await client.exists(key)) === 1;
}
