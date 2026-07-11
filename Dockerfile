# Multi-stage: build deps first, then copy only prod files
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Runtime image
FROM node:20-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S wedding && adduser -S wedding -G wedding

# Copy deps and app source
COPY --from=deps /app/node_modules ./node_modules
COPY server.js ./
COPY admin.html ./
COPY public ./public

# Data directory (mounted from host via docker volume for persistence)
RUN mkdir -p data && chown -R wedding:wedding /app

USER wedding

EXPOSE 3000
CMD ["node", "server.js"]
