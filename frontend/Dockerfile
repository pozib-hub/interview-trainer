ARG NODE_IMAGE=node:22-alpine
ARG NGINX_IMAGE=nginx:alpine

FROM ${NODE_IMAGE} AS build
ARG NPM_REGISTRY=https://registry.npmjs.org
COPY certs/corp-ca.pem /certs/corp-ca.pem
ENV NODE_EXTRA_CA_CERTS=/certs/corp-ca.pem
WORKDIR /app
COPY package.json ./
RUN npm config set registry ${NPM_REGISTRY} && npm install
COPY . .
RUN npm run build

FROM ${NGINX_IMAGE}
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
