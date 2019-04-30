# Notes

## List containers
```
docker container ls
```
## Build
```
docker-compose up -d --build
```
## Bring everything down
```
docker-compose down --remove-orphans
```
## More
```
docker attach 
docker exec -it monzo_balance_php_1 sh
docker system prune -a
```
## Purge then build (removes everything docker based!)
```
docker-compose down --remove-orphans; docker system prune -a -f; docker volume prune -f; docker-compose up -d --build;
```
## Module examples
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
