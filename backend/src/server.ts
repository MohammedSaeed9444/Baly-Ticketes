import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import ticketRoutes from './routes/tickets.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const prisma = new PrismaClient();

// Fix for __dirname in ES modules (TypeScript)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection test
prisma.$connect()
  .then(() => console.log('✅ Successfully connected to the database'))
  .catch((error) => console.error('❌ Failed to connect to the database:', error));

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://baly-ticketes-production.up.railway.app']
    : ['http://localhost:8080', 'http://localhost:3001'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ✅ Correct frontend path
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Routes
app.use('/api/tickets', ticketRoutes);

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  if (err instanceof Error) {
    if (err.message.includes("Can't reach database server")) {
      return res.status(503).json({
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }

  return errorHandler(err, req, res, next);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
