FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# "/" faz o frontend usar URLs relativas. O Nginx encaminha /api ao backend,
# evitando CORS e endereços localhost gravados no bundle de produção.
ARG VITE_API_BASE=/
ARG VITE_DEPLOY_DOMAIN=
ENV VITE_API_BASE=${VITE_API_BASE} \
    VITE_DEPLOY_DOMAIN=${VITE_DEPLOY_DOMAIN}

RUN npm run build

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY --from=build /app/docs/ /usr/share/nginx/html/docs/

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=4 \
  CMD ["wget", "-q", "-O", "-", "http://127.0.0.1/healthz"]
