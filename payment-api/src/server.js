const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const stoppable = require('stoppable');

const { validateEnv, env } = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Route imports
const paymentRoutes = require('./routes/payment.routes');
const webhookRoutes = require('./routes/webhook.routes');

// ── Bootstrap ──────────────────────────────────────────────
validateEnv();

const app = express();

// ── Global Middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.isProduction
    ? process.env.FRONTEND_URL || 'http://localhost'
    : '*',
  credentials: true,
}));

// IMPORTANT: Webhook routes must be registered BEFORE express.json()
// because Stripe needs the raw body for signature verification.
app.use('/api/v1/payments/webhooks', webhookRoutes);

// JSON body parser for all other routes
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

if (!env.isTest) {
  app.use(morgan('short', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// ── Health Check ───────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'payment-api', timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/v1/payments', paymentRoutes);

// ── 404 Handler ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found.' });
});

// ── Global Error Handler ───────────────────────────────────
app.use(errorHandler);

// ── Server with Graceful Shutdown ──────────────────────────
const server = stoppable(http.createServer(app), 7000);

async function start() {
  await connectDB();
  server.listen(env.port, () => {
    logger.info(`Payment API running on port ${env.port} [${env.nodeEnv}]`);
  });
}

async function shutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.stop(async () => {
    logger.info('HTTP server closed.');
    await disconnectDB();
    logger.info('Graceful shutdown complete.');
    process.exit(0);
  });

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

module.exports = app;
