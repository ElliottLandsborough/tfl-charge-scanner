# TFL Charge Scanner

https://londoncommute.uk

## What?

Checks your transactions to see how much you waste on London transport (Have you considered buying a [bicycle from Amazon](https://amzn.to/2RK1qCz)?)

Laravel 5, React, Docker

## Why?

To learn the [Monzo](https://docs.monzo.com/)/[Starling](https://developer.starlingbank.com/docs) APIs.

## How?
```
git clone git@github.com:ElliottLandsborough/tfl-charge-scanner.git
cd tfl-charge-scanner
composer install
cp .env.example .env
php artisan key:generate
[add monzo api keys to .env file along with any other changes]
php artisan serve --port=5678
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

## How with docker?
```
docker-compose up -d
```

## Todo
 - mobile layout
 - local storage?
