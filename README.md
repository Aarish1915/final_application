# 🚀 Ingri World - Enterprise Modernization

This repository contains the refactored, modernized, and security-hardened version of the Ingri World e-commerce platform.

## 🏗️ Architecture Overview

The application has been successfully migrated from a legacy, vulnerable Serverless/Monolithic structure into a robust, cloud-agnostic **MVC Architecture** with strict separation of concerns.

### 1. Unified Database Strategy (Prisma + PostgreSQL)
- **Problem:** The legacy app suffered from split-brain data (DynamoDB + MongoDB) and connection exhaustion.
- **Solution:** Migrated entirely to a high-performance **Neon PostgreSQL** database.
- **ORM:** Implemented **Prisma ORM** for strict type-safety, automatic connection pooling, and inherent protection against SQL Injection.

### 2. Defense-in-Depth Security 🛡️
- **JWT Middleware:** Replaced pure reliance on AWS API Gateway with code-level JWT verification (`auth.middleware.mjs`). The application now actively defends itself.
- **Role-Based Access Control (RBAC):** Admin endpoints are mathematically locked behind strict permission checks, neutralizing BFLA and BOLA (IDOR) vulnerabilities.
- **Traffic Protection:** Integrated `express-rate-limit` (DDoS mitigation) and `helmet` (Secure HTTP headers).

### 3. CI/CD & DevOps Pipeline ⚙️
- **Enterprise GitHub Actions:** Fully configured pipeline (`.github/workflows/ci.yml`).
- **Parallel Testing:** Automated Linting, TypeScript checks, and Vitest/Jest unit testing across Node 18 & 20 environments.
- **Security Scanning:** Automated SAST (Semgrep) and Dependency scanning (Snyk) on every pull request.
- **Dockerized:** The entire stack (Frontend, Admin, Backend) is containerized via `docker-compose.yml` for instant local staging and seamless cloud deployment.

### 4. Seamless Guest & Authenticated Checkout
- **Razorpay Integration:** Refactored the payment webhook logic to securely handle guest checkouts without forcing account registration.
- **OAuth 2.0:** Integrated Google OAuth (Implicit JWT Flow) for returning customers to seamlessly track past orders.

---

## 🚀 How to Run Locally

Because the application is fully Dockerized, you do not need Node.js installed to run it.

1. Clone the repository.
2. Populate the `.env` variables (see `.env.example`).
3. Run the following command:
   ```bash
   docker-compose up -d --build
   ```
4. Access the applications:
   - **Main Website:** `http://localhost:3000`
   - **Admin Dashboard:** `http://localhost:3001`
   - **API Backend:** `http://localhost:5000`

---
*Engineered to modern enterprise standards.*
