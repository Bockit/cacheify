var test = require('tape')
var through = require('through')
var browserify = require('browserify')
var level = require('levelup')
var memdown = require('memdown')
var cacheify = require('../index')

var db = level('/dev/null', { db: memdown })

test('Passes options object', function(t) {

    function optionsChecker(file, options) {
        t.deepEqual(options, {'poop': true},
            'Options object passed to child transform.')

        t.end()

        return through()
    }

    var cached = cacheify(optionsChecker, db)
    var b = browserify()

    b.add('./tests/sample')
    b.transform({'poop': true}, cached)
    b.bundle()
})