# TFL Charge Scanner for Monzo/Starling

https://londoncommute.uk

## What?

Checks your transactions to see how much you waste on London transport (Have you considered buying a [bicycle from Amazon](https://amzn.to/2RK1qCz)?)

Laravel 5, React, Docker

## Why?

...

## How?
```
git clone git@github.com:ElliottLandsborough/monzo-balance.git
cd monzo-balance
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
 - local storage?
