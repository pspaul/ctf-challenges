FROM node:15-alpine

RUN apk add socat

WORKDIR /app/
COPY baby.js /app/

RUN addgroup -S baby \
    && adduser -S baby -G baby

CMD [ "socat", "tcp-listen:1337,reuseaddr,fork", "exec:'node baby'.js,su=baby" ]
