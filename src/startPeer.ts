import { RedisClientType } from 'redis';
import { readFileSync } from 'fs';
import { ExpressPeerServer } from 'peer';

const express = require('express');
const https = require('https');
const app = express();

export const startPeer = async (redis: RedisClientType<any, any>) => {
  const httpsServer = https.createServer({
    key: readFileSync(`${process.cwd()}/certs/jamelio.local+2-key.pem`),
    cert: readFileSync(`${process.cwd()}/certs/jamelio.local+2.pem`),
  }, app);


  app.use(express.static('./client'))

  app.enable('trust proxy')

  app.use((req: any, res: any, next: any) => {
    req.secure ? next() : res.redirect(`https://${req.headers.host}${req.url}`)
  })

  httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
  });

  const peerServer = ExpressPeerServer(httpsServer, {
    path: '',
  });

  app.use('/peer', peerServer);

  app.get('/stats', async (req: any, res: any) => {
    const membersOnlineCount = await redis.get('membersOnlineCount');
    res.send(`Members online: ${membersOnlineCount}`)
  })

  peerServer.on('connection', (client: any) => {
    console.log(`Connected: ${client.id}`)
    redis.incr('membersOnlineCount')
    /*
        if (client.id === 'john') {
          console.log('john is not allowed, will disconnect in 3 seconds...')
          setTimeout(() => {
            client.getSocket().close()
          }, 3000)
        }
    */
  });

  peerServer.on('disconnect', (client: any) => {
    console.log(`Disconnected: ${client.id}`)
    redis.decr('membersOnlineCount')
  });

  return { peerServer };
}