ARG DOCKER_SERVER_HOST
ARG DOCKER_SERVER_PORT
ARG DOCKER_PROJECT_PATH
ARG DOCKER_NODE_VERSION
ARG DOCKER_IMAGE_VERSION=master

FROM ${DOCKER_SERVER_HOST}:${DOCKER_SERVER_PORT}/${DOCKER_PROJECT_PATH}/node${DOCKER_NODE_VERSION}-base:${DOCKER_IMAGE_VERSION}

RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.31-r0/glibc-2.31-r0.apk && \
    apk add glibc-2.31-r0.apk

ARG DOCKER_MINTER_DOWNLOAD_URL=''
ARG DOCKER_MINTER_BINARY=minter

RUN   cd /tmp && \
  export DOWNLOAD_URL="${DOCKER_MINTER_DOWNLOAD_URL}" && \
  echo "DOWNLOADING: $DOWNLOAD_URL" && \
  wget -nv $DOWNLOAD_URL -O minter.zip && \
  unzip minter.zip && \
  rm -f minter.zip && \
  chmod 0777 $DOCKER_MINTER_BINARY && \
  mv $DOCKER_MINTER_BINARY /usr/bin/ && \
  chmod +x /usr/bin/minter

###
### Envs
###
ENV MY_USER="minter-runner" \
    MY_GROUP="minter-runner" \
    MY_UID="1000" \
    MY_GID="1000"

####
#### User/Group
####
RUN set -eux \
    && addgroup -g ${MY_GID} ${MY_GROUP} \
    && adduser -u ${MY_UID} -G ${MY_GROUP} -s /bin/bash -D ${MY_USER}