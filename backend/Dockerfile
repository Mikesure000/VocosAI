FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY prisma ./prisma
COPY dist ./dist

# Generate Prisma client
RUN npx prisma generate

# Create data directory
RUN mkdir -p /app/data

EXPOSE 8787

VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/vocosai.sqlite
ENV HOST=0.0.0.0
ENV PORT=8787

# Seed on first run
COPY --chmod=+x <<-EOF /app/entrypoint.sh
#!/bin/sh
npx prisma db push --skip-generate 2>/dev/null || true
npx tsx prisma/seed.ts 2>/dev/null || true
exec node dist/index.js
EOF

ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
