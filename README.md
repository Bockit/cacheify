Cacheify
=================

Cacheify is a caching layer for browserify transforms. You specify a cache (leveldb-api-compatible object). You then use the resulting object as your transform in the browserify bundling process.

The default hash function is passed the contents of the file. If you want to pass in anything else you'll need to use a closure.

Example usage
-------------

``` JavaScript
var cacheify = require('cacheify')
  , coffeeify = require('coffeeify')
  , levelup = require('levelup')
  , db = levelup('./cache');

...

var cachingCoffeeify = cacheify(db, coffeeify)

...

b.transform(cachingCoffeeify)
```