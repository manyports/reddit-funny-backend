import express from 'express';
import cors from 'cors';
import { handleRequest } from './api/startCron';
import { fetchRedditPosts } from './lib/FetchReddit';
import http from 'http';
import WebSocket from 'ws';

const app = express();
const port = process.env.PORT || 8080; 

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));  

app.get('/start-cron', handleRequest);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let cachedPosts: any[] = [];

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.send(JSON.stringify({ type: 'INITIAL_POSTS', data: cachedPosts }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

setInterval(async () => {
  cachedPosts = await fetchRedditPosts('funny');
  const message = JSON.stringify({ type: 'NEW_POSTS', data: cachedPosts });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
  console.log('Broadcasted new posts');
}, 10000);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
