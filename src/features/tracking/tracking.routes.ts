import { Router } from 'express';

import {
  getPublicPlatformConfigController,
  getPublicTrackingConfigController,
} from './tracking.controller';

export const trackingRoutes = Router();

trackingRoutes.get('/config', getPublicTrackingConfigController);
trackingRoutes.get('/platform', getPublicPlatformConfigController);
