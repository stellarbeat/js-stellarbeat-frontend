var fs = require("fs");
var browserify = require("browserify");
var vueify = require("vueify");
var babelify = require("babelify");
var unflowify = require('unflowify');
var envify = require('envify');

var b = browserify("./src/index.js")
    .transform(unflowify)
    .transform(babelify, {presets: ["babel-preset-env"]})
    .transform(vueify)
    .transform({ global: true },envify)
    .bundle()
    .pipe(fs.createWriteStream("dist/quorum-monitor.js"));