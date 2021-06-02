#!/usr/bin/env bash
try
(

  rancher_lock && rancher_login && helm_cluster_login
  rancher_namespace
  helm_init_namespace
  namespace_secret_additional_project_registry ${CI_PROJECT_NAME} ${CI_REGISTRY_USER} ${CI_JOB_TOKEN}

  ${KUBECTL} -n ${KUBE_NAMESPACE} create secret generic ${CI_PROJECT_NAME}-generic \
      --from-literal=APP_NAME="minter-node" \
      --from-literal=APP_ENV="${APP_ENV}" \
      --from-literal=APP_VERSION="${CI_COMMIT_REF_NAME}" \
      \
      --from-literal=APP_SENTRY_ENABLED="${APP_SENTRY_ENABLED}" \
      --from-literal=APP_SENTRY_DSN="${APP_SENTRY_DSN}" \
      \
      --from-literal=APP_DUMP_URL="${APP_DUMP_URL}" \
      \
      --from-literal=APP_BLOCKCHAIN_RUN_NODE="${APP_BLOCKCHAIN_RUN_NODE}" \
      --from-literal=APP_BLOCKCHAIN_HOME="${APP_BLOCKCHAIN_HOME}" \
      --from-literal=APP_BLOCKCHAIN_BIN_FILE_PATH="${APP_BLOCKCHAIN_BIN_FILE_PATH}" \
      --from-literal=APP_BLOCKCHAIN_CONFIG_DIR="${APP_BLOCKCHAIN_CONFIG_DIR}" \
      --from-literal=APP_BLOCKCHAIN_LOGS_TO_STDOUT="${APP_BLOCKCHAIN_LOGS_TO_STDOUT}" \
      --from-literal=APP_BLOCKCHAIN_NOTIFY_NEW_BLOCK="${APP_BLOCKCHAIN_NOTIFY_NEW_BLOCK}" \
      \
      --from-literal=APP_BLOCKCHAIN_GENESIS_FILE_LINK="${APP_BLOCKCHAIN_GENESIS_FILE_LINK}" \
      --from-literal=APP_CONFIGURATOR_P2P_SEEDS="${APP_CONFIGURATOR_P2P_SEEDS}" \
      --from-literal=APP_CONFIGURATOR_P2P_PERSISTENT_PEERS="${APP_CONFIGURATOR_P2P_PERSISTENT_PEERS}" \
      --from-literal=APP_CONFIGURATOR_GENERAL_MONIKER="${APP_CONFIGURATOR_GENERAL_MONIKER}" \
      --from-literal=APP_CONFIGURATOR_GENERAL_LOG_LEVEL="${APP_CONFIGURATOR_GENERAL_LOG_LEVEL}" \
      --from-literal=APP_BLOCKCHAIN_IS_TESTNET="${APP_BLOCKCHAIN_IS_TESTNET}" \
      \
      --from-literal=APP_STATUS_PAGE_ENABLED="${APP_STATUS_PAGE_ENABLED}" \
      --from-literal=APP_STATUS_PAGE_GENERAL_API_URL="${APP_STATUS_PAGE_GENERAL_API_URL}" \
      \
  -o yaml --dry-run | ${KUBECTL} -n ${KUBE_NAMESPACE} replace --force -f -

  namespace_secret_acme_cert ingress-cert ${KUBE_INGRESS_CERT_HOSTNAME}
)
catch || {
  rancher_logout && rancher_unlock helm_cluster_logout
  exit $ex_code
}

rancher_logout && rancher_unlock && helm_cluster_logout
