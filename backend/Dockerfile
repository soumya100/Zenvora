# ==============================================================================
# Zenvora Backend Multi-Stage Production Dockerfile
# ==============================================================================

# Stage 1: Build & TypeScript compilation
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Copy source code and tsconfig
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript in /dist
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Stage 2: Minimal Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

# Run as unprivileged node user for security
USER node

# Copy production dependencies and built code
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

EXPOSE 3000

# Health check
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health', (r) => {if (r.statusCode !== 200) process.exit(1)})"

CMD ["node", "dist/server.js"]
