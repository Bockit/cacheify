Cacheify
=================

Cacheify is a caching layer for browserify transforms. You specify a transform and a cache and it handles the rest by wrapping everything in its own browserify transform that you'll pass to the bundling process.

You can also specify custom filter and hash functions to be specific about which files get cached, and how a file is decided to be unique.

Example usage
-------------

``` JavaScript
var cacheify = require('cacheify')
  , coffeeify = require('coffeeify')
  , level = require('level')
  , db = level('./cache');

...

var coffeeify = cacheify(coffeeify, db)

...

b.transform(cachingCoffeeify)
```

API
---

###### `cacheify(transform, db)` ######

Creates a new cacheify transform.

- `transform`: The transform you want to cache the output of
- `db`: A levelup-api compatible database object, or a function that returns such an object. This is where the results of cached transforms are stored.

###### `cacheify.filter(fn)` ######

Replaces the default filter function (always returns true) with a function of your choosing. The filter function is called per file and if it returns a truthy value we will cache the results of the transform of the file, or read from the cache if it's already there. If it returns false we will apply the original transform without caching.

- `fn`: The filter function you want to use. It takes one argument, the file path. If `fn` is a RegExp object, `cacheify.filter` will wrap it in a function that tests each filename against it.

###### `cacheify.hash(fn)` ######

Replaces the default hash function (md5 of the file's contents) with a function of your choosing. The hash function will be used to generate a unique key for a file, that we will check to see if it exists in the DB before applying the original transform. 

- `fn`: The hash function you want to use. It takes two arguments, the file contents and the file path.

Changelog
---------

- **0.2.1**: When the filter returns false, instead of passing an empty through pass the original uncached transform. That way it can handle what gets transformed and we only handle what gets cached.

- **0.2.0**: Do not use, has breaking bugs!! 0.2.1 fixes them. Apologies!
  * Changed the API significantly.
  * Added the ability to specify a filter function to be selective about which files are transformed.
  * Because hash is optional like filter, changed how you apply a custom hash function to be similar to how you apply a custom filter function.
  * Changed the order of arguments to cacheify, it takes the transform first and the db second
  * The db argument can now be a function instead of an object. If it is, it will call that function to get the db object. This gives you more flexibility when working in environments with complicated locking orders on the dbs.

TODO
----

- Tests, seriously.

License
-------

BSD, see the LICENSE.md for more information.
