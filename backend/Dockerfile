ARG GOLANG_IMAGE=golang:1.26-alpine
ARG NODE_IMAGE=node:22-alpine

FROM ${GOLANG_IMAGE} AS build
ARG GOPROXY=https://proxy.golang.org,direct
ARG GOSUMDB=sum.golang.org
ENV GOPROXY=${GOPROXY} GOSUMDB=${GOSUMDB}
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /out/server ./cmd/server

FROM ${NODE_IMAGE}
ARG NPM_REGISTRY=https://registry.npmjs.org
WORKDIR /app
COPY --from=build /out/server /app/server
COPY tasks ./tasks
COPY questions ./questions
COPY runtime/package.json ./runtime/
RUN npm config set registry ${NPM_REGISTRY} && cd runtime && npm install --omit=dev && npm cache clean --force
# Security: сервер и раннер (в нём исполняется пользовательский код!) работают
# под непривилегированным пользователем node — пользовательский код не может
# изменять задачи, бинарь сервера и файлы образа. runtime нужен на запись:
# туда при старте пишется worker.mjs.
RUN mkdir -p /app/runtime && chown -R node:node /app/runtime
USER node
ENV TASKS_DIR=/app/tasks \
    QUESTIONS_DIR=/app/questions \
    RUNTIME_DIR=/app/runtime \
    HTTP_ADDR=:8080
EXPOSE 8080
ENTRYPOINT ["/app/server"]
