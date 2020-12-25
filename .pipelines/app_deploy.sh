#!/usr/bin/env bash
function app_deploy() {
    echo "$(tput bold)$(tput setb 4)$(tput setaf 3)$1$(tput sgr0)"
    HELM_APP_NAME=$2
    rancher_login && helm_cluster_login

    sed \
        -e "s#__RELEASE_BRANCH__#${GIT_BRANCH}#g" \
        -e "s#__RELEASE_HASH__#${HELM_ENV}#g" \
        \
        .helm/${CI_PROJECT_NAME}-${HELM_APP_NAME}/Chart.template.yaml > \
        .helm/${CI_PROJECT_NAME}-${HELM_APP_NAME}/Chart.yaml

    ${HELM} --namespace ${KUBE_NAMESPACE} list
#    ${HELM} --namespace ${KUBE_NAMESPACE} uninstall ${CI_PROJECT_NAME}-${HELM_APP_NAME}

    helm_deploy \
        ${CI_PROJECT_NAME}-${HELM_APP_NAME} \
        ${DOCKER_IMAGE_VERSION} \
        "\
            --atomic \
            --debug \
            --timeout 1800s \
            --set env=$HELM_ENV \
            --set replicaCount=$KUBE_REPLICA_COUNT \
            --set project_name=$CI_PROJECT_NAME \
            --set app.secretPrefix=$CI_PROJECT_NAME \
            --set ingress.hostName=$KUBE_INGRESS_HOSTNAME \
            --set ingress.path=$KUBE_INGRESS_PATH \
            --set image.repository.host=$DOCKER_SERVER_HOST \
            --set image.repository.port=$DOCKER_SERVER_PORT \
            --set image.repository.project=$DOCKER_PROJECT_PATH \
            --set image.repository.app_name=$HELM_APP_NAME \
            --set image.repository.env=dev \
        "
}

app_deploy "Deploy helm dev_job" "app"
