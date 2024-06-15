import axios, { AxiosResponse } from 'axios';

interface Post {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  upvotes: number;
  downvotes: number;
  author: string;
}

export async function fetchRedditPosts(subreddit: string): Promise<Post[]> {
  let posts: Post[] = [];
  let after: string | null = null;

  while (posts.length < 10) {
    try {
      const response: AxiosResponse<any> = await axios.get(`https://www.reddit.com/r/${subreddit}/top.json?limit=100`, {
        params: { after },
      });

      const imagePosts: Post[] = response.data.data.children
        .filter((post: any) => post.data.url.includes('i.redd.it'))
        .map((post: any) => ({
          id: post.data.id,
          title: post.data.title,
          url: post.data.url,
          thumbnail: post.data.thumbnail,
          upvotes: post.data.ups,
          downvotes: post.data.downs,
          author: post.data.author,
        }));

      posts = [...posts, ...imagePosts];
      after = response.data.data.after;
    } catch (error) {
      console.error('Error fetching data from Reddit:', error);
      return [];
    }
  }

  return posts.slice(0, 10);
};