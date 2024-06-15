import cron from 'node-cron';
import { fetchRedditPosts } from "./FetchReddit"
import { Post } from '../types/Post';

let cachedPosts: Post[] = [];

cron.schedule('*/10 * * * * *', async () => {
  cachedPosts = await fetchRedditPosts('funny');
  console.log('Fetched latest posts from r/funny');
});

export function getCachedPosts(){
    return cachedPosts;
}