import { RedisClientType } from 'redis';
import { readFileSync } from 'fs';
import { ExpressPeerServer } from 'peer';
import { randomBytes } from 'crypto';

const { rando } = require('@nastyox/rando.js');

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

  app.get('/api/memberId', async (req: any, res: any) => {
    const { p: peerId } = req.query;
    const members = await redis.lRange('members', 0, -1);
    res.send({ id: rando(members.filter(member => member !== peerId)).value })
  })

  app.get('/api/token', async (req: any, res: any) => {
    const token = randomBytes(256).toString('base64url');
    res.send({ token })
  })

  peerServer.on('connection', async (client: any) => {
    console.log(`Connected: ${client.id}`)
    redis.incr('membersOnlineCount')
    const result = await redis.rPush('members', client.id);
    console.log(result)


    /*
        if (client.id === 'john') {
          console.log('john is not allowed, will disconnect in 3 seconds...')
          setTimeout(() => {
            client.getSocket().close()
          }, 3000)
        }
    */
  });

  peerServer.on('disconnect', async (client: any) => {
    console.log(`Disconnected: ${client.id}`)
    redis.decr('membersOnlineCount')
    const result = await redis.lRem('members', 0, client.id);
    console.log(result)

  });

  return { peerServer };
}