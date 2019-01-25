FROM php:7-fpm-alpine

# change uid and gid for www-data user (alpine)
RUN apk --no-cache add shadow && \
    usermod -u 1000 www-data && \
    groupmod -g 1000 www-data

# composer
FROM composer:latest as vendor

COPY database/ database/

COPY composer.json composer.json
COPY composer.lock composer.lock

RUN composer install \
    --ignore-platform-reqs \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist

# build css & js
FROM node:current-alpine as frontend

RUN mkdir -p ./public/css

COPY package.json webpack.mix.js ./
COPY resources/ resources/

WORKDIR ./

RUN npm install --production && npm run prod
