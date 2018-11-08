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
app.use("/", serveStatic ('./dist') );

app.listen(port, () => console.log('app listening on port: ' + port));