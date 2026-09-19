# Multi-stage Dockerfile for TaskPulse Enterprise
FROM node:20-alpine AS base
WORKDIR /app

# Stage 1: Build client frontend
FROM base AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM base AS runner
WORKDIR /app
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --prefix server --production

COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./server/public

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000
CMD ["npm", "start", "--prefix", "server"]
