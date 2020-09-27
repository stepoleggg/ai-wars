import express from 'express';
import * as http from 'http';
import Session from './Session.js';
import * as WebSocket from 'ws';
import gameTypes from './GameTypes.js';

const app = express();
const serverHTTP = http.createServer(app);
const serverWS = new WebSocket.Server({ server: serverHTTP });

const status = {
  isPlaying: false,
};
let session;

serverWS.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const type = data.type;
    switch(type) {
      case 'setFrameDelay':
        session.setFrameDelay(data.frameDelay);
        break;
    }
  });
});

const sendAllClients = (message) => {
  serverWS.clients.forEach((c) => {
    c.send(message);
  });
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.urlencoded());
app.use(express.json());

app.get('/status', (req, res) => {
  res.send(status);
});
app.post('/start', async (req, res) => {
  const numberGames = req.body.numberGames;
  const playerAddresses = req.body.playerAddresses;
  const gameType = req.body.gameType;
  const Game = gameTypes[gameType];
  const created = Game !== undefined
  && status.isPlaying !== true
  && numberGames > 0
  && playerAddresses !== undefined
  && playerAddresses.length > 0;
  res.send({
    created,
  });
  if (created) {
    status.isPlaying = true;
    status.gameType = gameType;
    session = new Session(numberGames, playerAddresses, gameType, Game, sendAllClients);
    await session.start();
    status.isPlaying = false;
    sendAllClients(JSON.stringify({
      type: 'stopInfo',
    }));
  }
});
app.post('/stop', (req, res) => {
  status.isPlaying = false;
  session.stop();
  res.send({
    stopped: true,
  });
});

serverHTTP.listen(process.env.PORT || 8999, () => {
  console.log(`Server started on port ${serverHTTP.address().port} :)`);
});