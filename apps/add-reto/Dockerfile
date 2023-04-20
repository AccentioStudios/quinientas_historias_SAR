FROM node:18-alpine
LABEL authors="Accentio Studios"

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .
