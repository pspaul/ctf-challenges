FROM node:13-alpine

ENV NODE_ENV=production

# install dependencies
WORKDIR /app
ADD package.json package-lock.json /app/
RUN npm install

# add the actual app
ADD ./ /app

ENV PORT=1337 BIND_ADDR=0.0.0.0
EXPOSE 1337

USER 1000

CMD [ "npm", "run", "start" ]
