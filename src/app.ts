import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { errorHandler } from './core/middlewares/errorHandler';
import { authRoutes } from './features/auth/auth.routes';
import { studentsRoutes } from './features/students/students.routes';
import { coursesRoutes } from './features/courses/courses.routes';
import { lessonsRoutes } from './features/lessons/lessons.routes';

export const app = express();

app.use(cors());
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

app.use(errorHandler);