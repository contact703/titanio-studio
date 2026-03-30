FROM node:20-alpine

WORKDIR /app

# Instala dependências
COPY backend/package*.json ./
RUN npm ci --only=production

# Copia o código
COPY backend/ ./
COPY frontend/build/ ./public/

# Expoõe a porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
