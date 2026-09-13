import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import axios from 'axios';
import searchRoutes from './routes/search.routes';
import healthRoutes from './routes/health.routes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

export function createApp(): express.Application {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  const corsOrigins = config.corsOrigin === '*' ? '*' : config.corsOrigin.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: corsOrigins,
      methods: ['GET', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  if (config.env !== 'test') {
    app.use(morgan(config.isProduction ? 'combined' : 'dev'));
  }

  // Image proxy route for DuckDuckGo and SearXNG thumbnails
  app.get('/i/:file', async (req, res) => {
    try {
      const file = req.params.file;
      if (!/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(file)) {
        res.status(404).send('Not Found');
        return;
      }
      const targetUrl = `https://duckduckgo.com/i/${file}`;
      const response = await axios.get(targetUrl, {
        responseType: 'stream',
        timeout: 4000,
      });
      const contentType = response.headers['content-type'];
      if (contentType) {
        res.setHeader('Content-Type', String(contentType));
      }
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      response.data.pipe(res);
    } catch {
      res.status(404).send('Image Not Found');
    }
  });

  app.use('/', healthRoutes);
  app.use('/api', searchRoutes);
  app.use('/api', healthRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
