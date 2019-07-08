FROM node:10-alpine

LABEL maintainer="contato@casadosdados.com.br"

RUN apk add --no-cache git
WORKDIR /sinesp
ENV NODE_ENV production
COPY package.json .
COPY package-lock.json .
RUN npm i --only=production

copy . .
EXPOSE 3000
ENTRYPOINT [ "node", "index.js" ]