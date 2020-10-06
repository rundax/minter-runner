#!/usr/bin/env bash
################### run tests ###################
function dev_app_test() {
    IMAGE=${DOCKER_SERVER_HOST}:${DOCKER_SERVER_PORT}/${DOCKER_PROJECT_PATH}/app_test:${DOCKER_IMAGE_VERSION}
    COMMAND=$1
    docker run --rm -t $IMAGE $COMMAND
}

#dev_app_test "yarn lint"
#dev_app_test "yarn test"
