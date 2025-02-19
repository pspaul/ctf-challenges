FROM node:22-alpine3.20

RUN apk add --no-cache tini firefox

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci

COPY . /app

ENTRYPOINT ["tini", "--"]
CMD ["npm", "start"]
