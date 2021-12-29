ARG DOCKER_SERVER_HOST
ARG DOCKER_PROJECT_PATH
ARG DOCKER_NODE_VERSION
ARG DOCKER_IMAGE_VERSION=master

FROM ${DOCKER_SERVER_HOST}/${DOCKER_PROJECT_PATH}/node${DOCKER_NODE_VERSION}-yarn:${DOCKER_IMAGE_VERSION}

ENV CI_COMMIT_REF_SLUG=${DOCKER_IMAGE_VERSION}

WORKDIR /app

COPY package.json /app
COPY yarn.lock /app

RUN --mount=type=cache,sharing=shared,id=yarn_cache,target=/usr/local/share/.cache/yarn yarn install --verbose

COPY . /app

RUN yarn run build-dev
