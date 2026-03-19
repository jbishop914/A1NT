FROM node:20-slim

WORKDIR /app

# Copy package files from monorepo root
COPY package.json package-lock.json ./

# Install only production dependencies + tsx for TypeScript execution
RUN npm ci --omit=dev && npm install tsx

# Copy the voice pipeline source
COPY src/lib/voice/ ./src/lib/voice/
COPY tsconfig.json ./

EXPOSE ${PORT:-8081}

# Health check — Railway uses this to know the service is ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8081}/health || exit 1

CMD ["npx", "tsx", "src/lib/voice/voice-server.ts"]
