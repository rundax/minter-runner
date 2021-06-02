### Деполй приложения в Kubernetes кластер

## Минимальные системные требования:
 * Kubernetes кластер с установленной версией Rancher не ниже 2
 * Helm 2
 * Persistent storage

## Переменные окружения и секреты

Для того чтоб собрать проект и задеплоить его в кластер в папке .pipelines собраны скрипты для билда образа, добавления секретов, и деплоля хелм чарта.
Для начала нужно добавить необходимые переменные в файл .env.devops.

Доступ к docker registry и путь к образу
```
CI_REGISTRY=registry.company.com:443
CI_REGISTRY_USER=root
CI_JOB_TOKEN=root

DOCKER_SERVER_HOST=registry.company.com:443
DOCKER_PROJECT_PATH=minter/node-runner
DOCKER_NODE_VERSION=14
DOCKER_IMAGE_VERSION=master
DOCKER_MINTER_DOWNLOAD_URL=https://github.com/MinterTeam/minter-go-node/releases/download/v1.2-testnet-6/minter_1.2.0_715ef1f8_linux_amd64.zip
```

Доступы к кластеру
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

Переменные для доступа в cloudflare api key(для генерации динамического ssl сертификата и добавления его в ingress контроллер)
```
CF_EMAIL=admin@company.com
CF_KEY=************************
```

Так как система разрабатывалась для непрерывной интеграции так-же нужно добавить имя ветки которое подставляется динамически в пайплайнах
```
GIT_BRANCH=stage
```

Переменные приложения.
Все переменные приложения начинаются с префикса APP_ и добавляются как секрет в кластер.
полный перечень переменных можно найти в файле prerequisites.sh
ВНИМАНИЕ: Каждый деплой перезаписывает этот секрет, удаляя всё, что у него было добавлено

Запуск скрипта из корневой папки репозитория .pipelines-debug.sh
```
bash .pipelines/.pipelines-debug.sh
```
