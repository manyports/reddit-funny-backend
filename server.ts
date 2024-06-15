import express from 'express';
import cors from 'cors';
import { handleRequest } from './api/startCron';

const app = express();
const port = process.env.PORT || 8080; 
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));  

app.get('/start-cron', handleRequest);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
