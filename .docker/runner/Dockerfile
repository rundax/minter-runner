ARG DOCKER_IMAGE_VERSION=master
ARG DOCKER_SERVER_HOST
ARG DOCKER_PROJECT_PATH
ARG DOCKER_NODE_VERSION
ARG DOCKER_SERVER_PORT
ARG APP_ENV=prod

FROM ${DOCKER_SERVER_HOST}:${DOCKER_SERVER_PORT}/${DOCKER_PROJECT_PATH}/app-${APP_ENV}:${DOCKER_IMAGE_VERSION} AS app
FROM ${DOCKER_SERVER_HOST}:${DOCKER_SERVER_PORT}/${DOCKER_PROJECT_PATH}/node${DOCKER_NODE_VERSION}-minter:${DOCKER_IMAGE_VERSION}

RUN apk update && \
    apk upgrade && \
    apk add aria2

COPY --from=app /app/dist /app

EXPOSE 8841
WORKDIR /app

STOPSIGNAL SIGINT

ADD .docker/runner/predownload_dump.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/predownload_dump.sh

ENV NODE_OPTIONS="--enable-source-maps"
CMD ["node", "app.js"]
