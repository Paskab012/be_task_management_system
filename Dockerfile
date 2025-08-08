# Builder stage
FROM --platform=linux/amd64 node:20-alpine AS builder

RUN apk add --no-cache make g++ python3

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# Build and transform path aliases to relative paths
RUN yarn build
RUN npx tsc-alias -p tsconfig.json

# Final production image
FROM --platform=linux/amd64 node:18-alpine AS production

RUN apk add --no-cache \
    make \
    g++ \
    python3 \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package.json yarn.lock ./

# Install all dependencies (including dev dependencies for ts-node)
RUN yarn install --frozen-lockfile && \
    yarn add dotenv

# Copy configuration files
COPY .sequelizerc ./
COPY .env* ./
COPY tsconfig.json ./

# Copy built and transformed application
COPY --from=builder /app/dist ./dist

# Copy source files (needed for Sequelize config and migrations)
COPY --from=builder /app/src ./src

# Ensure the config directory exists
RUN mkdir -p /app/src/database/config

ENV NODE_ENV=production

# Create start script using ts-node for migrations
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Checking database configuration..."' >> /app/start.sh && \
    echo 'if [ ! -f "/app/src/database/config/config.js" ]; then' >> /app/start.sh && \
    echo '  echo "Error: config.js not found. Please ensure it exists."' >> /app/start.sh && \
    echo '  exit 1' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'echo "Running database migrations..."' >> /app/start.sh && \
    echo 'npx ts-node --project tsconfig.json ./node_modules/.bin/sequelize-cli db:migrate --env production || echo "Migration failed, but continuing..."' >> /app/start.sh && \
    echo 'echo "Running database seeders..."' >> /app/start.sh && \
    echo 'npx ts-node --project tsconfig.json ./node_modules/.bin/sequelize-cli db:seed:all --env production || echo "Seeding failed, but continuing..."' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'node dist/main.js' >> /app/start.sh && \
    chmod +x /app/start.sh

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["/app/start.sh"]