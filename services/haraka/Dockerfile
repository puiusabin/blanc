FROM node:18-alpine

WORKDIR /app

# Install Haraka globally
RUN npm install -g Haraka

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy Haraka configuration and plugins
COPY config/ /app/config/
COPY plugins/ /app/plugins/

# Expose SMTP ports
EXPOSE 25 587 465

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD nc -z localhost 25 || exit 1

# Start Haraka
CMD ["haraka", "-c", "/app/config"]