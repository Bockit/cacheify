var through  = require('through')
  , crypto   = require('crypto')
  , concat   = require('concat-stream')

function cacheify (cachee, _db) {

  /**
   * Default to taking the md5 of a file
   */
  function hash (content) {
    return crypto
      .createHash('md5')
      .update(content)
      .digest('hex');
  }

  /**
   * Default to caching every file
   */
  function filter () {
    return true
  }

  /**
   * Transforms a file, reading it from cache instead if the hash exists in the
   * cache already.
   */
  function transform (file, options) {
    // Early exit if we don't match the filter
    if (!filter(file)) {
      return cachee(file, options)
    }

    var data = ''

    return through(write, end)

    // Build up the file data...
    function write (buf) { data += buf; }

    // Do our transform if we need to, or get it from the cache if we can.
    function end () {
      var hashed = hash(data, file)
      var self = this
      var db = _db

      // Let db be a function that returns a leveldb api compatible object.
      if (typeof db === 'function') db = db()

      db.get(hashed, function (err, transformed) {
        // err means it wasn't in the db
        if (err) {
          var cacher = concat(function(d) {
            d = d || ' '
            db.put(hashed, d)
            self.queue(d)
            self.queue(null)
          })

          var tf = cachee(file, options)
          tf.on('error', function(err) {
            self.emit('error', err)
          })
          tf.pipe(cacher)
          tf.write(data)
          tf.end()
        }
        // Already cached
        else {
          self.queue(transformed)
          self.queue(null)
        }
      });
    }
  }

  /**
   * Lets you set a custom filter function. A filter function receives one
   * argument, the name of the file. Return true to check cacheify for a file,
   * false to use a default through stream.
   */
  transform.filter = function(_fn) {
    var fn = _fn
    if (fn instanceof RegExp) {
      fn = function(name) {
        return _fn.test(name)
      }
    }
    filter = fn

    return transform
  }

  /**
   * Lets you set a custom hash function. The hash function receives two
   * arguments, the contents of the file and the name of the file. It's up to
   * you if and how you choose to use them.
   *
   * If you pass a RegExp object instead of a function, we'll wrap it in a
   * function that checks the filename on the regexp, returning true for a
   * match.
   */
  transform.hash = function(fn) {
    hash = fn

    return transform
  }

  return transform
}

module.exports = cacheify
