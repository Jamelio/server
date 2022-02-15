import { readFileSync } from 'fs';

const { ExpressPeerServer } = require('peer');

const express = require('express');
const https = require('https');
const app = express();

const httpsServer = https.createServer({
  key: readFileSync('/Users/sergeibasharov/WebstormProjects/jamelio/peer-server/certs/jamelio.local+2-key.pem'),
  cert: readFileSync('/Users/sergeibasharov/WebstormProjects/jamelio/peer-server/certs/jamelio.local+2.pem'),
}, app);


app.use(express.static('./client'))

app.enable('trust proxy')

app.use((req: any, res: any, next: any) => {
  req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
})

httpsServer.listen(443, () => {
  console.log('HTTPS Server running on port 443');
});

const peerServer = ExpressPeerServer(httpsServer, {
  path: '/',
});


app.use('/jamelio', peerServer);
