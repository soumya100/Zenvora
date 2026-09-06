import { createApp } from './app';
import { config } from './config/env';

const app = createApp();

let server: any;

if (process.env.VERCEL !== '1') {
  server = app.listen(config.port, config.host, () => {
    console.log(`
  ======================================================
  🛡️  Zenvora Backend API Server Running
  ======================================================
  - Local URL:     http://${config.host}:${config.port}
  - Environment:   ${config.env}
  - SearXNG Upstream: ${config.searxngUrl}
  - Mock Search:   ${config.mockSearch}
  ======================================================
    `);
  });

  const shutdown = () => {
    console.log('Received termination signal. Gracefully closing Zenvora API server...');
    if (server) {
      server.close(() => {
        console.log('Zenvora API server closed cleanly.');
        process.exit(0);
      });
    }
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

export default app;
