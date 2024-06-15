import express from 'express';
import cors from 'cors';
import { handleRequest } from './api/startCron';
import { fetchRedditPosts } from './lib/FetchReddit';
import https from 'https';
import fs from 'fs';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080; 

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.get('/start-cron', handleRequest);

const privateKey = fs.readFileSync('server.key', 'utf8');
const certificate = fs.readFileSync('server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const server = https.createServer(credentials, app);

const wss = new WebSocket.Server({ server });

let cachedPosts: any[] = [];

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.send(JSON.stringify({ type: 'INITIAL_POSTS', data: cachedPosts }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const fetchAndBroadcastPosts = async () => {
  try {
    cachedPosts = await fetchRedditPosts('funny');
    const message = JSON.stringify({ type: 'NEW_POSTS', data: cachedPosts });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
    console.log('Broadcasted new posts');
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};

setInterval(fetchAndBroadcastPosts, 10000);

server.listen(port, () => {
  console.log(`Server running at https://localhost:${port}`);
});
