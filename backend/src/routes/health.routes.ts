import { Router, Request, Response } from 'express';
import { searxngService } from '../services/searxng.service';
import { config } from '../config/env';

const router = Router();

router.get(['/health', '/api/health'], async (req: Request, res: Response) => {
  const upstream = await searxngService.checkUpstreamHealth();

  res.json({
    status: 'ok',
    service: 'zenvora-api',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: config.env,
    upstreamSearxng: {
      reachable: upstream.healthy,
      latencyMs: upstream.latencyMs,
    },
  });
});

export default router;
