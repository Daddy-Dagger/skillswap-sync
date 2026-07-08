# SkillSwap Sync Deployment & TiDB Configuration Guide

This guide details the steps to set up, secure, and deploy the **SkillSwap Sync** application to production using **TiDB** (TIBD) as the database.

---

## 🔍 Code Safety & Quality Checks Summary
Before proceeding to deploy, here is a summary of the checks performed on your codebase:

1. **Database Connection Configuration**: 
   - **Issue Resolved**: The database connection in `api/queries/connection.ts` previously used a direct connection string with `mode: "planetscale"`. While this worked for PlanetScale, it was prone to runtime timeout errors (`ECONNRESET`) and lacked SSL verification settings required by TiDB Serverless.
   - **Resolution Applied**: We replaced the connection handler to use a `mysql2/promise` connection pool with `enableKeepAlive: true` and secure SSL configuration enabled automatically when the connection string points to a TiDB cluster. Dialect mode is dynamically toggled to `"default"` for TiDB (which supports full relational constraints) and `"planetscale"` otherwise.
2. **TypeScript & Compilation Validity**:
   - Ran compilation checks (`npm run check`) and build checks (`npm run build`). Both compiled successfully with no bundle or syntax errors.
3. **Database Transactions**:
   - Checked critical operations like transaction updates (e.g. credit updates in `api/queries/credits.ts`). The database transactions (`db.transaction`) are structured correctly, preventing race conditions or partial updates.
4. **Git Safeguards**:
   - Checked `.gitignore`. Sensitive environments (`.env`, `.env.local`), compiled files (`dist/`, `build/`), and dependencies (`node_modules/`) are correctly excluded from git tracking.

---

## 1. Database Setup (TiDB Cloud)
TiDB Serverless is a fully MySQL-compatible, serverless SQL database with auto-scaling. Follow these steps to set it up:

1. Sign up/log in to **[TiDB Cloud](https://pingcap.com/products/tidb-cloud)**.
2. Create a new **TiDB Serverless** cluster (typically free tier covers all development and initial launch needs).
3. Once the cluster is active, click **Connect** on the dashboard.
4. Select **Connect with MySQL connection string** or **Connection parameters**.
5. Copy the generated connection string. It will look like:
   ```
   mysql://<username>:<password>@<host>:<port>/<database_name>?ssl={"rejectUnauthorized":true}
   ```
6. Add this connection URL to your `.env` file in production as the `DATABASE_URL`.

---

## 2. Database Migration & Seeding
Drizzle ORM manages the schema and migrations. To sync your schema to TiDB:

1. **Generate Migration Files**:
   Generate the SQL migration scripts based on the schema in `db/schema.ts`:
   ```bash
   npm run db:generate
   ```
2. **Apply Migrations**:
   Push the schema to your TiDB database (run this after setting `DATABASE_URL` in `.env`):
   ```bash
   npm run db:push
   ```
3. **Seed Database**:
   Seed the default skills and categories (we have added a `db:seed` script to `package.json` for convenience):
   ```bash
   npm run db:seed
   ```

---

## 3. Production Environment Variables
Set the following environment variables in your deployment hosting provider:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Production environment flag | `production` |
| `PORT` | The port the server binds to | `3000` (Default if omitted) |
| `DATABASE_URL` | TiDB secure connection string | `mysql://user:pass@host:3306/db?ssl=...` |
| `APP_ID` | OAuth Client App ID | Your Kimi/OAuth Application ID |
| `APP_SECRET` | OAuth Client signing secret key | Your 32+ character signing key |
| `KIMI_AUTH_URL` | External OAuth authentication host | `https://auth.example.com` |
| `KIMI_OPEN_URL` | External OAuth client API host | `https://api.example.com` |
| `OWNER_UNION_ID` | The ID of the owner admin user | `admin_user_id` |

---

## 4. Deployment Methods

Because your application builds both the React client bundle and a unified Hono (Node.js) web server, you can deploy the entire stack as a **single unified server service**. In production mode, Hono automatically serves the compiled static client assets from `dist/public`.

### Option A: App Hosting Platforms (Render, Railway, Fly.io) — *Recommended*
These are the easiest platforms to host unified Node.js applications.

1. **Host Connection**: Link your GitHub repository to [Render](https://render.com/) or [Railway](https://railway.app/).
2. **Service Type**: Create a new **Web Service**.
3. **Settings**:
   - **Environment / Runtime**: `Node.js` (Choose Node version `20` or higher)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start` (this runs `NODE_ENV=production node dist/boot.js`)
4. **Environment Variables**: Add all environment variables listed in Section 3 above.

### Option B: Docker Container Deployment (AWS, GCP, DigitalOcean)
We created a production-ready [Dockerfile](file:///Users/aryan/Documents/app/Dockerfile) in the project root. You can build and deploy the container:

1. **Build the image**:
   ```bash
   docker build -t skillswap-sync .
   ```
2. **Run locally to verify**:
   ```bash
   docker run -p 3000:3000 --env-file .env skillswap-sync
   ```
3. Deploy to Docker-based services like **GCP Cloud Run**, **AWS ECS/App Runner**, or **Fly.io** directly using the configuration.

### Option C: Separation of Frontend and Backend (Vercel + Standalone Server)
If you prefer to host your frontend statically on **Vercel** and host the backend elsewhere:
1. Update `vite.config.ts` if needed, and import tRPC endpoints using the absolute production URL instead of relative paths.
2. Host the backend on Render/Railway.
3. Configure CORS on the backend to allow requests from your Vercel URL.
