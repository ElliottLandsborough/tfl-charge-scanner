# Monzo Balance

https://londoncommute.uk

## What can this do?

Checks your monzo transactions to see how much you waste on london transport (why don't you just [buy a bike](https://amzn.to/2RK1qCz)?)

## How do I run it locally?
```
git clone git@github.com:ElliottLandsborough/monzo-balance.git
cd monzo-balance
composer install
php artisan serve
```
To compile and watch dev assets:
```
npm install
npm run watch
```
Or to compile production assets:
```
npm run prod
```

## How do I run it with docker?
```
docker-compose up -d
```

## Notes
```
docker container ls
docker-compose up -d --build
docker-compose down --remove-orphans
docker attach 
docker exec -it monzo_balance_php_1 sh
docker system prune -a
```
Module examples
```
# install nginx, php, and php extensions for Craft
RUN apk add --no-cache \
    bash \
    nginx \
    php7 \
    php7-fpm \
    php7-opcache \
    php7-phar \
    php7-zlib \
    php7-ctype \
    php7-session \
    php7-fileinfo \
# Required php extensions for Craft
    php7-pdo \
    php7-pdo_mysql \
    php7-gd \
    php7-openssl \
    php7-mbstring \
    php7-json \
    php7-curl \
    php7-zip \
# Optional extensions for Craft
    php7-iconv \
    php7-intl \
    php7-dom \
# Extra Optional extensions for Craft
    imagemagick \
    php7-imagick

CMD sh
```
