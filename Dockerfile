# Use Node.js 22.14.0 (matching package.json engines)
FROM node:22.14.0-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules (if any)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code and build artifacts
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port (App Runner will override this)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/healthcheck', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"] 