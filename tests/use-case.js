var test = require('tape')
var through = require('through')
var browserify = require('browserify')
var level = require('levelup')
var memdown = require('memdown')
var cacheify = require('../index')

var db = level('/dev/null', { db: memdown })

/**
 * We want to run cacheify with a through stream that we want to get called
 * once, despite running the bundle function once.
 */
test('Only transforms once', function(t) {
    var counts = {
        transform: 0, // How many times we transformed
        bundle: 0 // How many times we ran
    }

    function counter(file) {
        return through(function(data) {
            this.queue(data)
        }, function() {
            counts.transform++
            this.queue(null)
        })
    }
    var cachingCounter = cacheify(counter, db)

    var called = 0
    function bundle(cb) {
        // Keep track of how many times we're called
        called++
        var b = browserify()
        // It's weird we have to use the path from package.json and not relative
        // to this file.
        b.add('./tests/sample')
        b.transform(cachingCounter)
        b.bundle({}, function(err, src) {
            counts.bundle++
            cb()
        })
    }

    // Only call once we've finished bundling everything.
    function finish() {
        t.equal(counts.transform, 1, 'Transform only performed once.')
        t.equal(counts.bundle, called, 'Bundle called twice.')
        t.end()
    }

    // Run a few times
    bundle( function() { bundle(finish) } )
});