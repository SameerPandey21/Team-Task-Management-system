# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN apk add --no-cache python3 make g++ git openssl
COPY frontend/ .
RUN npm install
RUN npm run build

# Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN apk add --no-cache python3 make g++ git openssl
COPY backend/ .
RUN npm install
COPY --from=frontend-builder /app/dist ./frontend/dist
RUN npx prisma generate

# Production image
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY backend/ .
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/dist ./frontend/dist
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "index.js"]
