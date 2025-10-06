import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // YouTube search endpoint
  app.get("/api/youtube/search", async (req, res) => {
    try {
      const { q, maxResults = 5 } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
      }

      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'YouTube API key not configured' });
      }

      const url = new URL('https://www.googleapis.com/youtube/v3/search');
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('q', q);
      url.searchParams.set('type', 'video');
      url.searchParams.set('videoCategoryId', '10'); // Music category
      url.searchParams.set('maxResults', String(maxResults));
      url.searchParams.set('key', apiKey);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json({ error: error.error?.message || 'YouTube API error' });
      }

      const data = await response.json();
      
      const results = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
      })) || [];

      res.json({ results });
    } catch (error) {
      console.error('YouTube search error:', error);
      res.status(500).json({ error: 'Failed to search YouTube' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
