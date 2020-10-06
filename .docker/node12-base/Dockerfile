FROM node:12.18.3-alpine3.9

RUN apk update && \
    apk upgrade && \
    apk add bash

WORKDIR /app

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN mkdir /docker-entrypoint.d
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
