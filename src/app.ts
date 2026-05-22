import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler } from './core/middlewares/errorHandler';
import { authRoutes } from './features/auth/auth.routes';
import { studentsRoutes } from './features/students/students.routes';
import { coursesRoutes } from './features/courses/courses.routes';
import { lessonsRoutes } from './features/lessons/lessons.routes';
import { progressRoutes } from './features/progress/progress.routes';
import { analyticsRoutes } from './features/analytics/analytics.routes';
import { exercisesRoutes } from './features/exercises/exercises.routes';
import { uploadsRoutes } from './features/uploads/uploads.routes';
import { teacherRoutes } from './features/teacher/teacher.routes';
import { adminRoutes } from './features/admin/admin.routes';
import { paymentsRoutes } from './features/payments/payments.routes';
import { trackingRoutes } from './features/tracking/tracking.routes';
import { env } from './config/env';

export const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origem não permitida pelo CORS.'));
    },
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (request, response) => {
  return response.status(200).json({
    status: 'ok',
    message: 'API ISOMÉTRICA online.',
  });
});

app.use('/auth', authRoutes);
app.use('/students', studentsRoutes);
app.use('/courses', coursesRoutes);
app.use('/lessons', lessonsRoutes);
app.use('/progress', progressRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/teacher', teacherRoutes);
app.use('/admin', adminRoutes);
app.use('/payments', paymentsRoutes);
app.use('/tracking', trackingRoutes);
app.use('/', exercisesRoutes);
app.use('/', uploadsRoutes);

app.use(
  '/uploads',
  express.static('uploads'),
);

app.use(errorHandler);
