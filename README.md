# Aethel — Multi-Vendor E-Commerce Microservices

A production-ready, containerized MERN-stack marketplace featuring a three-container microservices architecture, full Stripe payment integration, and CI/CD pipelines targeting free-tier hosting (Render).

## Architecture

1. **Frontend (`/frontend`)**: React 18 SPA built with Vite. Served by Nginx, which also acts as an API Gateway reverse-proxying requests to the backend services. Premium dark-mode UI built with Vanilla CSS.
2. **Core API (`/core-api`)**: Node.js/Express monolith handling Users, Auth, Products, and Cart. Connects to MongoDB Atlas.
3. **Payment API (`/payment-api`)**: Dedicated Node.js microservice handling Stripe PaymentIntents, webhook processing, idempotency, and the transaction ledger.

## Quick Start (Local Development)

### 1. Prerequisites
- Docker & Docker Compose installed
- MongoDB Atlas cluster (M0 Free tier is sufficient for dev)
- Stripe account (Test Mode)

### 2. Environment Variables
Copy `.env.example` to `.env` in the root directory and fill in your keys:
```bash
cp .env.example .env
```
Ensure you provide real `MONGO_URI`, `JWT_SECRET`, `SERVICE_SECRET`, and your Stripe keys.

### 3. Run with Docker Compose
```bash
docker-compose up --build
```
This will start:
- Frontend & Nginx on `http://localhost:80`
- Core API on `http://localhost:5000`
- Payment API on `http://localhost:5001`

### 4. Stripe Webhooks (Local testing)
To test webhooks locally, use the Stripe CLI to forward events to the Payment API:
```bash
stripe listen --forward-to localhost:5001/api/v1/payments/webhooks/stripe
```
Update your `.env` with the webhook secret output by the command above.

## CI/CD & Deployment

This repository includes two GitHub Actions workflows:
- **`ci.yml`**: Runs on PRs to `main`. Spins up containers via `docker-compose.test.yml` and runs integration tests.
- **`deploy.yml`**: Runs on pushes to `main`. Builds Docker images, pushes them to GitHub Container Registry (GHCR), and triggers Render deployment hooks.

To enable automatic deployment, configure the following secrets in your GitHub repository:
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `RENDER_CORE_HOOK`
- `RENDER_PAYMENT_HOOK`
- `RENDER_FRONTEND_HOOK`

## Inter-Service Communication

The Core API and Payment API communicate over the internal Docker network (`aethel-network`). The Core API uses an internal HTTP client with exponential backoff and circuit breaker patterns to request payment intents. The Payment API notifies the Core API of payment success/failure via a secure webhook using an `X-Service-Secret` header.
