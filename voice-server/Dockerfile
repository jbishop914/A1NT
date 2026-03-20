FROM node:20-slim

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files from monorepo root
COPY package.json package-lock.json ./

# Install all dependencies (prisma CLI needed for generate) + tsx for runtime
RUN npm ci && npm install tsx

# Copy Prisma schema and generate client into src/generated/prisma/
COPY prisma/ ./prisma/
COPY tsconfig.json ./
RUN npx prisma generate

# Copy shared dependencies imported by voice modules
# db.ts imports @/generated/prisma/client (already generated above)
COPY src/lib/db.ts ./src/lib/db.ts

# Copy the voice pipeline source
COPY src/lib/voice/ ./src/lib/voice/

EXPOSE ${PORT:-8081}

# Health check — Railway uses this to know the service is ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8081}/health || exit 1

CMD ["npx", "tsx", "src/lib/voice/voice-server.ts"]
