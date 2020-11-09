FROM node:15-alpine

# prepare dependencies
WORKDIR /app
ADD package.json package-lock.json /app/
RUN npm install

# add the rest of the app
ADD . /app

USER 1000
ENV RESOLVER_BIND_ADDR=0.0.0.0 RESOLVER_PORT=3000
ENV STATS_BIND_ADDR=127.0.0.1 STATS_PORT=3080

CMD [ "node", "server.js" ]
