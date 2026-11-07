import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  workers: 1,
  use: {
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'node ../backend/dist/server.js',
    url: 'http://localhost:3000/health',
    reuseExistingServer: true,
    timeout: 15000,
  },
});

