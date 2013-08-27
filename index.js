var through  = require('through')
  , crypto   = require('crypto')
  , concat   = require('concat-stream')

function cacheify (db, cachee, hash) {

  if (!hash) {
    hash = function (content) {
      return crypto
        .createHash('md5')
        .update(content)
        .digest('hex');
    }
  }

  return function (file) {
    var data = ''

    return through(write, end)

    function write (buf) { data += buf; }
    function end () {
      var hashed = hash(data)
      var self = this

      db.get(hashed, function (err, transformed) {
        if (err) {
          var join = concat(function(d) {
            db.put(hashed, d)
            self.queue(d)
            self.queue(null)
          })

          var tf = cachee(file)
          tf.pipe(join)
          tf.write(data)
          tf.end()
        }
        else {
          self.queue(transformed)
          self.queue(null)
        }
      });
    }
  }
}

module.exports = cacheify