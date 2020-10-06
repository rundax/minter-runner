#!/usr/bin/env bash
if test `echo ${GIT_BRANCH} | grep 'tags'`; then
    export CI_COMMIT_REF_NAME=v`echo ${GIT_BRANCH} |sed -e 's/refs\/tags\///g'`
else
    export CI_COMMIT_REF_NAME=`echo ${GIT_BRANCH} |sed -e 's/origin\///g'`
fi

export DOCKER_IMAGE_VERSION=${CI_COMMIT_REF_NAME}
