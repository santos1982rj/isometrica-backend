import { Router } from 'express';

import { getPublicTrackingConfigController } from './tracking.controller';

export const trackingRoutes = Router();

trackingRoutes.get('/config', getPublicTrackingConfigController);
