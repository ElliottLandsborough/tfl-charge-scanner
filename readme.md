# Monzo Balance

https://londoncommute.uk

## What can this do?

Checks your monzo transactions to see how much you waste on london transport (why don't you just [buy a bike](https://www.amazon.co.uk/gp/search/ref=as_li_qf_sp_sr_tl?ie=UTF8&tag=londoncommute-21&keywords=road bike&index=aps&camp=1634&creative=6738&linkCode=ur2&linkId=31b6ce5ccb33b26900caaea5c64ad1c2)?)

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

## To do list
 - refactor js api loop function
 - dockerize
 - deployment
