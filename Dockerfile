# Multi-stage build for ultra-small Docker image (~85MB)
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Persistent volume for local SQLite database file
VOLUME ["/app/data"]
ENV DATABASE_URL="file:/app/data/local.db"

EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
