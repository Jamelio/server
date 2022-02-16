import { createClient } from 'redis';

export const startRedis = async () => {
  const client = createClient();

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();
  await client.set('membersOnlineCount', 0);

  return client;
}