# Build Stage
FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Production Stage
FROM node:20-slim AS production

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Set Node environment to production
ENV NODE_ENV=production

# Copy built artifacts and node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
