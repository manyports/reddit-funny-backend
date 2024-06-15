import { Request, Response } from 'express';
import { fetchRedditPosts } from '../lib/FetchReddit';

export async function handleRequest(request: Request, response: Response): Promise<void> {
  try {
    const data = await fetchRedditPosts('funny');
    response.status(200).json({ message: 'Cron job started and initial data fetched', data });
  } catch (error) {
    response.status(500).json({ message: 'Error fetching data', error });
  }
}
