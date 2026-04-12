import { readFileSync } from 'fs';
import { Redis } from '@upstash/redis';

const envContent = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8');
const url = envContent.match(/^KV_REST_API_URL="(.+)"$/m)?.[1];
const token = envContent.match(/^KV_REST_API_TOKEN="(.+)"$/m)?.[1];

const redis = new Redis({ url, token });

try {
  // Test basic ops
  await redis.set('test:ping', 'pong', { ex: 60 });
  const val = await redis.get('test:ping');
  console.log('Redis SET/GET:', val);

  await redis.del('test:ping');
  console.log('Redis DEL: OK');

  console.log('\n--- Redis connection test passed! ---');
} catch (e) {
  console.error('ERROR:', e.message);
  process.exit(1);
}
