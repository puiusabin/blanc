FROM instrumentisto/haraka:latest

# Set working directory
WORKDIR /etc/haraka

# Copy package files for dependencies
COPY package*.json ./

# Install Node.js dependencies (including @blanc/database link)
RUN npm install --production

# Copy Haraka configuration files
COPY config/ ./config/
COPY plugins/ ./plugins/
COPY docs/ ./docs/

# Create runtime directories
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
