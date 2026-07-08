# ── Multi-stage Build for Hono + React Unified Server ───────────

# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (including devDependencies for building)
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Run the build process (compiles client assets and bundles backend server)
RUN npm run build

# Stage 2: Production runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production-only dependencies to keep image size small
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose server port
EXPOSE 3000

# Run the production build
CMD ["npm", "run", "start"]
