const express = require('express');
const app = express();
const serveStatic = require('serve-static');
const history = require('connect-history-api-fallback');

let port = process.env.PORT || 3000;
app.use(history());
app.use("/", serveStatic ('./dist') );

app.listen(port, () => console.log('app listening on port: ' + port));