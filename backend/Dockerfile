ARG GOLANG_IMAGE=golang:1.26-alpine
ARG NODE_IMAGE=node:22-alpine

FROM ${GOLANG_IMAGE} AS build
ARG GOPROXY=https://proxy.golang.org,direct
ARG GOSUMDB=sum.golang.org
ENV GOPROXY=${GOPROXY} GOSUMDB=${GOSUMDB}
COPY certs/corp-ca.pem /certs/corp-ca.pem
ENV SSL_CERT_FILE=/certs/corp-ca.pem
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /out/server ./cmd/server

FROM ${NODE_IMAGE}
ARG NPM_REGISTRY=https://registry.npmjs.org
COPY certs/corp-ca.pem /certs/corp-ca.pem
ENV NODE_EXTRA_CA_CERTS=/certs/corp-ca.pem
WORKDIR /app
COPY --from=build /out/server /app/server
COPY tasks ./tasks
COPY runtime/package.json ./runtime/
RUN npm config set registry ${NPM_REGISTRY} && cd runtime && npm install --omit=dev && npm cache clean --force
ENV TASKS_DIR=/app/tasks \
    RUNTIME_DIR=/app/runtime \
    HTTP_ADDR=:8080
EXPOSE 8080
ENTRYPOINT ["/app/server"]
