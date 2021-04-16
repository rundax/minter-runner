#!/usr/bin/env bash
function build_base_image() {
    IMAGE=$2
    DOCKER_PATH=$3
    docker_build_dir_args \
        ${IMAGE} \
        ${DOCKER_PATH} \
        "\
            --build-arg DOCKER_SERVER_HOST=$DOCKER_SERVER_HOST \
            --build-arg DOCKER_SERVER_PORT=$DOCKER_SERVER_PORT \
            --build-arg DOCKER_PROJECT_PATH=$DOCKER_PROJECT_PATH \
            --build-arg DOCKER_NODE_VERSION=$DOCKER_NODE_VERSION \
            --build-arg DOCKER_MINTER_DOWNLOAD_URL=$DOCKER_MINTER_DOWNLOAD_URL \
            --build-arg DOCKER_IMAGE_VERSION=$DOCKER_IMAGE_VERSION \
        "
    docker push ${IMAGE}
}


build_base_image "BUILD node-base" \
    "$DOCKER_SERVER_HOST:$DOCKER_SERVER_PORT/$DOCKER_PROJECT_PATH/node${DOCKER_NODE_VERSION}-base:$DOCKER_IMAGE_VERSION" \
    ".docker/node${DOCKER_NODE_VERSION}-base/"

build_base_image "BUILD node-minter" \
    "$DOCKER_SERVER_HOST:$DOCKER_SERVER_PORT/$DOCKER_PROJECT_PATH/node${DOCKER_NODE_VERSION}-minter:$DOCKER_IMAGE_VERSION" \
    ".docker/node${DOCKER_NODE_VERSION}-minter/"

build_base_image "BUILD node-yarn" \
    "$DOCKER_SERVER_HOST:$DOCKER_SERVER_PORT/$DOCKER_PROJECT_PATH/node${DOCKER_NODE_VERSION}-yarn:$DOCKER_IMAGE_VERSION" \
    ".docker/node${DOCKER_NODE_VERSION}-yarn/"
