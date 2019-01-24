FROM php:7-fpm-alpine

# change uid and gid for www-data user (alpine)
RUN apk --no-cache add shadow && \
    usermod -u 1000 www-data && \
    groupmod -g 1000 www-data

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy composer.lock and composer.json
COPY composer.lock composer.json /var/www/

# Fix perms before running build commands
RUN mkdir -p /var/www \
 && chown -R www-data:www-data /var/www

# Change current user to www-data
USER www-data

# Set working directory
WORKDIR /var/www

RUN composer install \
    --ignore-platform-reqs \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist

