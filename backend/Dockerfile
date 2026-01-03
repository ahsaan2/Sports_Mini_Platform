# Backend Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy remaining source
COPY . .

# Default environment
ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
