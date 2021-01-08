const express = require('express');
const app = express();
const history = require('connect-history-api-fallback');

let port = process.env.PORT || 3000;

app.use(history({
    rewrites: [
        { from: /\/faq$/, to: '/faq.html'},
        { from: /\/api$/, to: '/api.html'},
        { from: /\/terms-and-conditions$/, to: '/terms-and-conditions.html'}
    ]
}));
let cacheTime = 86400000*7; //7 day cache for assets
app.use(function (req, res, next) {
    if (req.url.match(/^\/(css|js|img|fonts)\/.+/) ||
        req.url.match(/^\/favicon.ico$/) ||
        req.url.match(/^\/.*\.worker.js$/)
    ) {
        res.setHeader('Cache-Control', 'public, max-age=' + cacheTime); // cache header
    }
    next();
});

app.use(express.static('dist-client'));

app.listen(port, () => console.log('app listening on port: ' + port));