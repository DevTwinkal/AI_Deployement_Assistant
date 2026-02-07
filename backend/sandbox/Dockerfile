
# 🐳 AI Deployment Sandbox Image
# Used for isolating untrusted builds and deployments

FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Setup non-root user
WORKDIR /app

# The user "node" comes with the official image
# We will use this user to run commands for security
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Default command keeps the container running to accept commands
CMD ["tail", "-f", "/dev/null"]
