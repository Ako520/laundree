var browserify = require('browserify-middleware')
var babelify = require('babelify')
var express = require('express')
var path = require('path')
var router = express.Router()

babelify.configure({presets: ['es2015']})
browserify.settings({
  transform: [babelify],
  standalone: 'Laundree'
})

router.get('/bundle.js', browserify(path.join(__dirname, '../client/index.js'), {
  cache: true,
  precompile: true
}))

module.exports = router
