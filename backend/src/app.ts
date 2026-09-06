import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
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

  app.use('/', healthRoutes);
  app.use('/api', searchRoutes);
  app.use('/api', healthRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
