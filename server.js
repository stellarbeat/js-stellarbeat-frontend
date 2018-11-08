const express = require('express');
const app = express();
const serveStatic = require('serve-static');
const history = require('connect-history-api-fallback');
const compression = require('compression');


let port = process.env.PORT || 3000;
app.use(compression());
app.use(history({
    rewrites: [
        { from: /\/about/, to: '/about/index.html'},
        { from: /\/api/, to: '/api/index.html'},
    ]
}));
let cacheTime = 86400000*7; //7 day cache for assets
app.use(function (req, res, next) {
    console.log(req.url);
    if (req.url.match(/^\/(css|js|img|fonts)\/.+/) ||
        req.url.match(/^\/favicon.ico$/) ||
        req.url.match(/^\/.*\.worker.js$/)
    ) {
        res.setHeader('Cache-Control', 'public, max-age=' + cacheTime); // cache header
    }
    next();
});

app.use("/", serveStatic ('./dist') );

app.listen(port, () => console.log('app listening on port: ' + port));