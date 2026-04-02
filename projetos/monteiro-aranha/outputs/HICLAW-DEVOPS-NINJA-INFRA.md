# Monteiro Aranha — Docker Compose Completo + Scripts de Deploy

Lendo contexto primeiro conforme lição aprendida.

```bash
📖 Verificando documentação
```

Carregando: MA-BRIEFING.md, PLANO-IMPLEMENTACAO-FERRAMENTAS.md, PLANO-SEGURANCA-MONTEIRO-ARANHA.md

---

## EXECUÇÃO: Docker Compose + Scripts de Deploy

Vou criar a infraestrutura **completa e pronta para produção** com todos os serviços, volumes persistentes, healthchecks, redes isoladas e scripts de backup/instalação.

### 1️⃣ **DOCKER COMPOSE COMPLETO**

```yaml
# /docker-compose.yml (Monteiro Aranha Production)

version: '3.9'

services:
  # ============================================
  # DATABASE LAYER
  # ============================================
  
  postgresql:
    image: postgres:16-alpine
    container_name: ma-postgresql
    environment:
      POSTGRES_USER: ${DB_USER:-ma_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-change_me_in_production}
      POSTGRES_DB: ${DB_NAME:-monteiro_aranha}
      POSTGRES_INITDB_ARGS: "-c max_connections=200 -c shared_buffers=256MB"
    volumes:
      - postgresql_data:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d
    ports:
      - "${DB_PORT:-5432}:5432"
    networks:
      - ma-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-ma_user}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    image: redis:7-alpine
    container_name: ma-redis
    command: redis-server --appendonly yes --appendfsync everysec --maxmemory ${REDIS_MAX_MEMORY:-512mb} --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "${REDIS_PORT:-6379}:6379"
    networks:
      - ma-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ============================================
  # AI & LLM LAYER
  # ============================================

  ollama:
    image: ollama/ollama:latest
    container_name: ma-ollama
    environment:
      OLLAMA_HOST: 0.0.0.0:11434
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "${OLLAMA_PORT:-11434}:11434"
    networks:
      - ma-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 16G
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"

  # ============================================
  # APPLICATION LAYER
  # ============================================

  app-backend:
    build:
      context: ./services/backend
      dockerfile: Dockerfile
    container_name: ma-app-backend
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      DB_HOST: postgresql
      DB_PORT: 5432
      DB_USER: ${DB_USER:-ma_user}
      DB_PASSWORD: ${DB_PASSWORD:-change_me_in_production}
      DB_NAME: ${DB_NAME:-monteiro_aranha}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      OLLAMA_HOST: http://ollama:11434
      JWT_SECRET: ${JWT_SECRET:-generate_secure_key}
      API_PORT: ${API_PORT:-3000}
      LOG_LEVEL: ${LOG_LEVEL:-info}
    depends_on:
      postgresql:
        condition: service_healthy
      redis:
        condition: service_healthy
      ollama:
        condition: service_healthy
    volumes:
      - ./services/backend:/app
      - /app/node_modules
      - backend_logs:/app/logs
    ports:
      - "${API_PORT:-3000}:3000"
    networks:
      - ma-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "5"

  app-frontend:
    build:
      context: ./services/frontend
      dockerfile: Dockerfile
    container_name: ma-app-frontend
    environment:
      REACT_APP_API_URL: ${REACT_APP_API_URL:-http://localhost:3000}
      REACT_APP_ENV: ${NODE_ENV:-production}
    depends_on:
      - app-backend
    volumes:
      - ./services/frontend:/app
      - /app/node_modules
      - frontend_build:/app/build
    ports:
      - "${FRONTEND_PORT:-3001}:80"
    networks:
      - ma-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-file: "5"

  # ============================================
  # MESSAGING & GATEWAY LAYER
  # ============================================

  whatsapp-gateway:
    build:
      context: ./services/whatsapp-gateway
      dockerfile: Dockerfile
    container_name: ma-whatsapp-gateway
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      WHATSAPP_API_KEY: ${WHATSAPP_API_KEY:-}
      WHATSAPP_PHONE_ID: ${WHATSAPP_PHONE_ID:-}
      BACKEND_URL: http://app-backend:3000
      GATEWAY_PORT: ${GATEWAY_PORT:-8080}
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      app-backend:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./services/whatsapp-gateway:/app
      - /app/node_modules
      - gateway_logs:/app/logs
    ports:
      - "${GATEWAY_PORT:-8080}:8080"
    networks:
      - ma-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "20m"
        max-