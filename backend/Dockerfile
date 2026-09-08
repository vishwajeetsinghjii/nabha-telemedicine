# Production Dockerfile for SIH25018 Nabha Telemedicine Backend
FROM node:18-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

USER node

CMD ["node", "src/server.js"]
