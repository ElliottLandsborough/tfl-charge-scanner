FROM php:7-fpm-alpine

# change uid and gid for www-data user (ubuntu)
#RUN usermod -u 1000 www-data

# change uid and gid for www-data user (alpine)
RUN apk --no-cache add shadow && \
    usermod -u 1000 www-data && \
    groupmod -g 1000 www-data

# Install dependencies (ubuntu)
#RUN apt-get update && apt-get install -y \
#    zip \
#    vim \
#    nano \
#    unzip \
#    git \
#    curl

# Install extensions
#RUN docker-php-ext-install mbstring zip exif pcntl

# Install composer
#RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
#WORKDIR /var/www

#RUN composer install \
#    --ignore-platform-reqs \
#    --no-interaction \
#    --no-plugins \
#    --no-scripts \
#    --prefer-dist
