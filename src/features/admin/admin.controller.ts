import { Request, Response } from 'express';

import { AppError } from '../../core/errors/AppError';

import {
  getAdminOverview,
  getTrackingSettings,
  getPlatformSettings,
  listAdminCourses,
  listAdminTransactions,
  listAdminUsers,
  updateCourseStatus,
  updateCourseCommercial,
  updateCourseSales,
  updateLessonPreview,
  updatePlatformSettings,
  updateTrackingSettings,
  updateUserAccess,
} from './admin.service';

function getRequiredParam(request: Request, name: string) {
  const value = request.params[name];

  if (!value || Array.isArray(value)) {
    throw new AppError('Parâmetro inválido.', 400);
  }

  return value;
}

export async function getAdminOverviewController(
  request: Request,
  response: Response,
) {
  const overview = await getAdminOverview();

  return response.status(200).json({
    overview,
  });
}

export async function listAdminUsersController(
  request: Request,
  response: Response,
) {
  const users = await listAdminUsers();

  return response.status(200).json({
    users,
  });
}

export async function listAdminCoursesController(
  request: Request,
  response: Response,
) {
  const courses = await listAdminCourses();

  return response.status(200).json({
    courses,
  });
}

export async function listAdminTransactionsController(
  request: Request,
  response: Response,
) {
  const transactions = await listAdminTransactions();

  return response.status(200).json({
    transactions,
  });
}

export async function updateUserAccessController(
  request: Request,
  response: Response,
) {
  const user = await updateUserAccess(
    getRequiredParam(request, 'userId'),
    request.body,
  );

  return response.status(200).json({
    user,
  });
}

export async function updateCourseStatusController(
  request: Request,
  response: Response,
) {
  const course = await updateCourseStatus(
    getRequiredParam(request, 'courseId'),
    request.body,
  );

  return response.status(200).json({
    course,
  });
}

export async function updateCourseCommercialController(
  request: Request,
  response: Response,
) {
  const course = await updateCourseCommercial(
    getRequiredParam(request, 'courseId'),
    request.body,
  );

  return response.status(200).json({
    course,
  });
}

export async function updateCourseSalesController(
  request: Request,
  response: Response,
) {
  const course = await updateCourseSales(
    getRequiredParam(request, 'courseId'),
    request.body,
  );

  return response.status(200).json({
    course,
  });
}

export async function updateLessonPreviewController(
  request: Request,
  response: Response,
) {
  const lesson = await updateLessonPreview(
    getRequiredParam(request, 'lessonId'),
    request.body,
  );

  return response.status(200).json({
    lesson,
  });
}

export async function getTrackingSettingsController(
  request: Request,
  response: Response,
) {
  const settings = await getTrackingSettings();

  return response.status(200).json({
    settings,
  });
}

export async function getPlatformSettingsController(
  request: Request,
  response: Response,
) {
  const settings = await getPlatformSettings();

  return response.status(200).json({
    settings,
  });
}

export async function updatePlatformSettingsController(
  request: Request,
  response: Response,
) {
  const settings = await updatePlatformSettings(request.body);

  return response.status(200).json({
    settings,
  });
}

export async function updateTrackingSettingsController(
  request: Request,
  response: Response,
) {
  const settings = await updateTrackingSettings(request.body);

  return response.status(200).json({
    settings,
  });
}
