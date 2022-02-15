import { PeerServer } from 'peer';

const start_peer = async () => {
  console.log('Starting peer server...');
  const peerServer = await PeerServer({ port: 443, path: '/jamelio', allow_discovery: true });
  peerServer.on('connection', (client: any) => {
    console.log(`Connected: ${client.id}`)
  });

  peerServer.on('disconnect', (client: any) => {
    console.log(`Disconnected: ${client.id}`)
  });

  console.log('Peer server started!')
}

start_peer().catch(console.log);