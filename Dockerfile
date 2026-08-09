# Stage 1: Build
FROM node:26-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx (non-root, unprivileged image)
FROM nginxinc/nginx-unprivileged:1.25-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# nginx-unprivileged already runs as the non-root "nginx" user and
# listens on high ports by default; we pin to 8080 explicitly via nginx.conf.
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
