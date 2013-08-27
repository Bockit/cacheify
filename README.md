Caching-Transform
=================

Caching transform is a caching layer for browserify transforms. You specify a namespace, a hash function and a transform, and then pass them as arguments to caching-transform. You then pass in each caching transform to browserify.

Caching transform uses leveldb to cache. The hash function gives the key, and the transform gives the content. If a key exists in the cache it won't run the transform again.

The hash function is passed the contents of the file. If you want to pass in anything else you'll need to use a closure.

Just to keep everything from ballooning, all cached transforms live in the same database, thus the need for a namespace.

Example usage
-------------

``` JavaScript
var cache = require('caching-transform')
  , md5string = require('caching-transform/md5string')
  , coffeeify = require('coffeeify')
  , jadeify = require('jadeify');

...

var cachingCoffeeify = cache('coffee', coffeeify, md5string)
  , cachingJadeify = cache('jade', jadeify, md5string);

...

b.transform(cachingCoffeeify)
b.transform(cachingJadeify)
```