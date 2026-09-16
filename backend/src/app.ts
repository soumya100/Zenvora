import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import searchRoutes from './routes/search.routes';
import healthRoutes from './routes/health.routes';
import aiRoutes from './routes/ai.routes';
import imageProxyRoutes from './routes/imageProxy.routes';
import { privacyLogger } from './middleware/privacyLogger';
import { methodFilter } from './middleware/security';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import { imageProxyService } from './services/imageProxy.service';

export function createApp(): express.Application {
  const app = express();

  // Trust first proxy hop (Caddy or Vercel edge)
  app.set('trust proxy', 1);

  // Security headers via Helmet (configured for seamless metasearch navigation)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Handled at Caddy / Reverse Proxy layer
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'unsafe-none' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'no-referrer' },
    })
  );

  // HTTP Method Filtering (Permits only GET, POST, HEAD, OPTIONS)
  app.use(methodFilter);

  // Strict CORS configuration
  let allowedOrigins: string | string[] = '*';
  if (config.isProduction) {
    if (config.corsOrigin && config.corsOrigin !== '*') {
      allowedOrigins = config.corsOrigin.split(',').map((o) => o.trim());
    } else if (config.domain && config.domain !== 'localhost') {
      allowedOrigins = [`https://${config.domain}`];
    } else {
      allowedOrigins = ['https://zenvora-beta.vercel.app', 'http://localhost:3000', 'http://localhost:5173'];
    }
  } else {
    allowedOrigins = config.corsOrigin && config.corsOrigin !== '*'
      ? config.corsOrigin.split(',').map((o) => o.trim())
      : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'];
  }

  app.use(
    cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request body parsing with strict size limits
  app.use(express.json({ limit: '50kb' }));
  app.use(express.urlencoded({ extended: true, limit: '50kb' }));

  // Privacy-first request logger (Zero query strings in logs)
  app.use(privacyLogger);

  // Legacy DuckDuckGo thumbnail proxy routed through the SSRF-safe image proxy pipeline
  app.get('/i/:file', async (req, res, next) => {
    const file = req.params.file;
    if (!/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+$/.test(file)) {
      res.status(404).send('Not Found');
      return;
    }
    try {
      const targetUrl = `https://duckduckgo.com/i/${file}`;
      const result = await imageProxyService.fetchImage(targetUrl);

      res.setHeader('Content-Type', result.contentType);
      if (result.contentLength) {
        res.setHeader('Content-Length', result.contentLength.toString());
      }
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      result.stream.pipe(res);
    } catch {
      res.status(404).send('Image Not Found');
    }
  });

  // Application routes
  app.use('/', healthRoutes);
  app.use('/api', searchRoutes);
  app.use('/api', healthRoutes);
  app.use('/api', aiRoutes);
  app.use('/api', imageProxyRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
