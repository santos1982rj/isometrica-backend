import { Request, Response } from 'express';

import { AppError } from '../../core/errors/AppError';

import {
  createManagedCourse,
  createManagedExercise,
  createManagedLesson,
  createManagedModule,
  deleteManagedCourse,
  deleteManagedLesson,
  deleteManagedModule,
  getTeacherKpis,
  listManagedCourses,
  updateManagedCourse,
  updateManagedLesson,
  updateManagedModule,
} from './teacher.service';

function getActor(request: Request) {
  if (!request.user) {
    throw new Error('Authenticated user missing from request.');
  }

  return request.user;
}

function getRequiredParam(request: Request, name: string) {
  const value = request.params[name];

  if (!value || Array.isArray(value)) {
    throw new AppError('Parâmetro inválido.', 400);
  }

  return value;
}

export async function listManagedCoursesController(
  request: Request,
  response: Response,
) {
  const courses = await listManagedCourses(getActor(request));

  return response.status(200).json({
    courses,
  });
}

export async function createManagedCourseController(
  request: Request,
  response: Response,
) {
  const course = await createManagedCourse(getActor(request), request.body);

  return response.status(201).json({
    course,
  });
}

export async function updateManagedCourseController(
  request: Request,
  response: Response,
) {
  const course = await updateManagedCourse(
    getActor(request),
    getRequiredParam(request, 'courseId'),
    request.body,
  );

  return response.status(200).json({
    course,
  });
}

export async function createManagedModuleController(
  request: Request,
  response: Response,
) {
  const module = await createManagedModule(
    getActor(request),
    getRequiredParam(request, 'courseId'),
    request.body,
  );

  return response.status(201).json({
    module,
  });
}

export async function updateManagedModuleController(
  request: Request,
  response: Response,
) {
  const module = await updateManagedModule(
    getActor(request),
    getRequiredParam(request, 'moduleId'),
    request.body,
  );

  return response.status(200).json({
    module,
  });
}

export async function createManagedLessonController(
  request: Request,
  response: Response,
) {
  const lesson = await createManagedLesson(
    getActor(request),
    getRequiredParam(request, 'moduleId'),
    request.body,
  );

  return response.status(201).json({
    lesson,
  });
}

export async function updateManagedLessonController(
  request: Request,
  response: Response,
) {
  const lesson = await updateManagedLesson(
    getActor(request),
    getRequiredParam(request, 'lessonId'),
    request.body,
  );

  return response.status(200).json({
    lesson,
  });
}

export async function deleteManagedCourseController(
  request: Request,
  response: Response,
) {
  await deleteManagedCourse(
    getActor(request),
    getRequiredParam(request, 'courseId'),
  );

  return response.status(204).send();
}

export async function deleteManagedModuleController(
  request: Request,
  response: Response,
) {
  await deleteManagedModule(
    getActor(request),
    getRequiredParam(request, 'moduleId'),
  );

  return response.status(204).send();
}

export async function deleteManagedLessonController(
  request: Request,
  response: Response,
) {
  await deleteManagedLesson(
    getActor(request),
    getRequiredParam(request, 'lessonId'),
  );

  return response.status(204).send();
}

export async function createManagedExerciseController(
  request: Request,
  response: Response,
) {
  const exercise = await createManagedExercise(
    getActor(request),
    getRequiredParam(request, 'lessonId'),
    request.body,
  );

  return response.status(201).json({
    exercise,
  });
}

export async function getTeacherKpisController(
  request: Request,
  response: Response,
) {
  const periodRaw = request.query.periodDays;
  const periodDays = Number(
    Array.isArray(periodRaw) ? periodRaw[0] : periodRaw,
  );

  const kpis = await getTeacherKpis(
    getActor(request),
    Number.isFinite(periodDays) ? periodDays : 30,
  );

  return response.status(200).json({
    kpis,
  });
}
