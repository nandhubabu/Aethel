const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const stoppable = require('stoppable');

const { validateEnv, env } = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const internalRoutes = require('./routes/internal.routes');

// ── Bootstrap ──────────────────────────────────────────────
validateEnv();

const app = express();

// ── Global Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (!env.isTest) {
  app.use(morgan('short', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}
app.use(apiLimiter);

// ── Health Check ───────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'core-api', timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/internal', internalRoutes);

// ── 404 Handler ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

// ── Global Error Handler ───────────────────────────────────
app.use(errorHandler);

// ── Server Startup with Graceful Shutdown ──────────────────
const server = stoppable(http.createServer(app), 7000); // 7s grace period

async function start() {
  await connectDB();
  server.listen(env.port, () => {
    logger.info(`Core API running on port ${env.port} [${env.nodeEnv}]`);
  });
}

async function shutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.stop(async () => {
    logger.info('HTTP server closed. Draining connections...');
    await disconnectDB();
    logger.info('Graceful shutdown complete.');
    process.exit(0);
  });

  // Force kill after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception — shutting down');
  process.exit(1);
});

start();

module.exports = app; // For testing
