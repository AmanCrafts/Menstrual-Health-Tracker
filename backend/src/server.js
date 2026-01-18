import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import config from './config/index.js';
import connectDB from './config/database.js';
import logger from './utils/logger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import {
  authRoutes,
  periodRoutes,
  symptomRoutes,
  moodRoutes,
  healthRoutes
} from './routes/index.js';

const app = express();
connectDB();

app.use(helmet());
app.use(cors(config.cors));

import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FlowSync API is running',
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/health', healthRoutes);

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FlowSync API v1.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'Login with email/password',
        'POST /api/auth/google': 'Login/register with Google',
        'GET /api/auth/me': 'Get current user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'POST /api/auth/logout': 'Logout user',
        'DELETE /api/auth/account': 'Delete user account'
      },
      periods: {
        'GET /api/periods': 'Get all period logs',
        'POST /api/periods': 'Create new period log',
        'GET /api/periods/stats': 'Get cycle statistics',
        'GET /api/periods/predictions': 'Get cycle predictions',
        'GET /api/periods/:id': 'Get period log by ID',
        'PUT /api/periods/:id': 'Update period log',
        'DELETE /api/periods/:id': 'Delete period log'
      },
      symptoms: {
        'GET /api/symptoms': 'Get all symptom logs',
        'POST /api/symptoms': 'Create/update symptom log',
        'GET /api/symptoms/analytics': 'Get symptom analytics',
        'GET /api/symptoms/date/:date': 'Get symptom log by date',
        'GET /api/symptoms/:id': 'Get symptom log by ID',
        'PUT /api/symptoms/:id': 'Update symptom log',
        'DELETE /api/symptoms/:id': 'Delete symptom log'
      },
      moods: {
        'GET /api/moods': 'Get all mood logs',
        'POST /api/moods': 'Create/update mood log',
        'GET /api/moods/analytics': 'Get mood analytics',
        'GET /api/moods/date/:date': 'Get mood log by date',
        'GET /api/moods/:id': 'Get mood log by ID',
        'PUT /api/moods/:id': 'Update mood log',
        'DELETE /api/moods/:id': 'Delete mood log'
      },
      health: {
        'GET /api/health': 'Get all health logs',
        'POST /api/health': 'Create/update health log',
        'GET /api/health/analytics': 'Get health analytics',
        'GET /api/health/date/:date': 'Get health log by date',
        'GET /api/health/:id': 'Get health log by ID',
        'PUT /api/health/:id': 'Update health log',
        'DELETE /api/health/:id': 'Delete health log'
      }
    }
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   FlowSync API Server Started Successfully!               ║
  ║                                                           ║
  ║   Environment: ${config.env.padEnd(40)}                   ║
  ║   Port: ${PORT.toString().padEnd(47)}                     ║
  ║   API URL: http://localhost:${PORT}/api                   ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

export default app;
