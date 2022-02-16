import { startPeer } from './startPeer';
import { startRedis } from './startRedis';

const start = async () => {
  const redis = await startRedis();
  const { peerServer } = await startPeer(redis);
}

start();