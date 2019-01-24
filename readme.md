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
docker exec -it php sh
