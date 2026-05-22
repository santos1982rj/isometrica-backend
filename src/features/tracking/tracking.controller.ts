import { Request, Response } from 'express';

import { getTrackingSettings } from '../admin/admin.service';

export async function getPublicTrackingConfigController(
  request: Request,
  response: Response,
) {
  const settings = await getTrackingSettings();

  return response.status(200).json({
    tracking: {
      googleTagManagerId: settings.googleTagManagerId,
      googleAnalyticsMeasurementId: settings.googleAnalyticsMeasurementId,
      metaPixelId: settings.metaPixelId,
    },
  });
}
