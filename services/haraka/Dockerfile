FROM instrumentisto/haraka:latest

# Set working directory
WORKDIR /app

# Copy package files for dependencies
COPY package*.json ./

# Install only public npm dependencies (excluding @blanc/database)
RUN npm install --omit=dev --ignore-scripts aws-sdk openpgp uuid || true

# Note: @blanc/database will be mounted as a volume from the host
# This allows for live updates during development

# Copy Haraka configuration files to /etc/haraka
WORKDIR /etc/haraka
RUN mkdir -p ./queue ./logs

# Expose SMTP ports
# Port 25: Standard SMTP
# Port 587: Submission (STARTTLS)
EXPOSE 25 587

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD nc -z localhost 25 || exit 1

# Start Haraka
CMD ["haraka", "-c", "/etc/haraka"]
