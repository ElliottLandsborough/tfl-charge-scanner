# Monzo Balance

https://londoncommute.uk

## What?

Checks your monzo transactions to see how much you waste on London transport (Have you considered buying a [bicycle from Amazon](https://amzn.to/2RK1qCz)?)

## Why?

...

## How?
```
git clone git@github.com:ElliottLandsborough/monzo-balance.git
cd monzo-balance
composer install
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
