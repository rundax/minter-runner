### Deployment application into Kubernetes

## Minimal requirements:
 * Kubernetes with Rancher > 2
 * Helm 2

## Add variables

Add docker image and registry
```
CI_REGISTRY=registry.company.com:443
CI_REGISTRY_USER=root
CI_JOB_TOKEN=root

DOCKER_SERVER_HOST=registry.company.com
DOCKER_SERVER_PORT=443
DOCKER_PROJECT_PATH=minter/node-runner
DOCKER_NODE_VERSION=12
DOCKER_IMAGE_VERSION=master
DOCKER_MINTER_DOWNLOAD_URL=https://github.com/MinterTeam/minter-go-node/releases/download/v1.2-testnet-6/minter_1.2.0_715ef1f8_linux_amd64.zip
```

Add kubernetes var
```
KUBE_CLUSTER=c-*****
KUBE_PROJECT=p-****
KUBE_INGRESS_HOSTNAME_SUFFIX=minter.company.com
KUBE_SERVER=https://rancher.company.com/v3
KUBE_TOKEN=token-cn6rn:**********************************************
KUBE_NAMESPACE=test
SENTRY_AUTH_TOKEN=*auth token*
SENTRY_DSN=https://fake@fake.local/123
SENTRY_ORG=company
SENTRY_PROJECT=minter-node
```

Add cloudflare api key(for generate ssl cert and add in ingress)
```
CF_EMAIL=admin@company.com
CF_KEY=************************
```
add branch name
```
GIT_BRANCH=stage
```

Add group APP_ variable for application. See list in prerequisites.sh

Run .pipelines-debug.sh from root folder
```
bash .pipelines/.pipelines-debug.sh
```
