#!/usr/bin/env bash
function app_deploy() {

    echo "$(tput bold)$(tput setb 4)$(tput setaf 3)$1$(tput sgr0)"
    HELM_CHART_NAME=$2
    HELM_APP_NAME=$3
    rancher_login && helm_cluster_login
    sed \
        -e "s#__APP_NAME__#${HELM_APP_NAME}#g" \
        -e "s#__APP_VERSION__#${DOCKER_IMAGE_VERSION}#g" \
        \
        .helm/${HELM_CHART_NAME}/Chart.template.yaml > \
        .helm/${HELM_CHART_NAME}/Chart.yaml

    ${HELM} --namespace ${KUBE_NAMESPACE} list
#    ${HELM} --namespace ${KUBE_NAMESPACE} uninstall ${HELM_APP_NAME}

    ${HELM} upgrade \
       --debug \
       --wait \
       --namespace ${KUBE_NAMESPACE} \
       --install ${HELM_APP_NAME} \
       .helm/${HELM_CHART_NAME} \
       \
       --set image.registry=${DOCKER_SERVER_HOST} \
       --set image.repository=${DOCKER_PROJECT_PATH}/app \
       --set image.hash=$(docker images --no-trunc --quiet ${DOCKER_SERVER_HOST}/${DOCKER_PROJECT_PATH}/app:${DOCKER_IMAGE_VERSION}) \
       --set image.tag=${DOCKER_IMAGE_VERSION} \
       --set image.pullSecret=docker-registry-${CI_PROJECT_NAME} \
       \
       --set app.externalSecrets[0]=${CI_PROJECT_NAME}-generic \
       \
       --set ingress.hostName=${KUBE_INGRESS_HOSTNAME} \
       --set ingress.path=${KUBE_INGRESS_PATH} \
       \
       --set replicaCount=${KUBE_REPLICA_COUNT}
}

app_deploy \
    "Deploy helm node runner app" \
    "minter-node-runner-app" \
    "node-runner"
