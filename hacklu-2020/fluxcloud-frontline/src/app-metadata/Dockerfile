FROM node:14-alpine

WORKDIR /app/

ADD package.json package-lock.json /app/
RUN npm install

ADD . /app/

ENV BIND_ADDR=0.0.0.0 PORT=80

CMD [ "node", "server.js" ]
