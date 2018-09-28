var fs = require("fs");
var browserify = require("browserify");
var vueify = require("vueify");
var babelify = require("babelify");
var unflowify = require('unflowify');
var envify = require('envify');
//var work = require('webworkify');

var b = browserify("./src/index.js")
    .transform(unflowify)
    .transform(vueify)
    .transform(babelify, {presets: ["es2015", "babel-preset-env"]})
    .transform({ global: true },envify)
    //.transform(work)
    .bundle()
    .pipe(fs.createWriteStream("dist/quorum-monitor.js"));