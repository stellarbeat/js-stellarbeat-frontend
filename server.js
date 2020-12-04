const path = require('path');
const Sentry = require("@sentry/node");
const express = require('express');
const server = express();
const template = require('fs').readFileSync('./public/ssr-template.html', 'utf-8');
const clientManifest = require('./dist-client/vue-ssr-client-manifest.json');
const { createBundleRenderer } = require('vue-server-renderer');
const serverBundle = require('./dist-server/vue-ssr-server-bundle.json')
let port = process.env.PORT || 3000;
const LRU = require("lru-cache");

const isProd = process.env.NODE_ENV === 'production';
if(isProd)
    Sentry.init({dsn: process.env.VUE_APP_SENTRY_DSN});


server.use("/img", express.static(path.join(__dirname, "./dist-client", "img")));
server.use("/js", express.static(path.join(__dirname, "./dist-client", "js")));
server.use("/css", express.static(path.join(__dirname, "./dist-client", "css")));
server.use(
    "/favicon.ico",
    express.static(path.join(__dirname, "./dist-client", "favicon.ico"))
);
server.use(
    "/robots.txt",
    express.static(path.join(__dirname, "./dist-client", "robots.txt"))
);
server.use(
    "/worker",
    express.static(path.join(__dirname, "./dist-client", "worker"))
);


let cacheTime = 86400000 * 7; //7 day cache for assets
server.use(async function (req, res, next) {
    if (req.url.match(/^\/(css|js|img|fonts)\/.+/) ||
        req.url.match(/^\/favicon.ico$/) ||
        req.url.match(/^\/.*\.worker.js$/)
    ) {
        res.setHeader('Cache-Control', 'public, max-age=' + cacheTime); // cache header
    }
    next();
});

const microCache = new LRU({
    max: 100,
    maxAge: 30000 // Important: entries expires after 1 second.
})

const renderer = createBundleRenderer(serverBundle, {
    runInNewContext: false, // recommended
    template, // (optional) page template
    clientManifest // (optional) client build manifest
})

server.get("*", async (req, res) => {
    try {
        const hit = microCache.get(req.url)
        if (hit) {
            res.type('text/html');
            return res.end(hit)
        }

        let html = await renderer.renderToString({url: req.url});
        microCache.set(req.url, html);
        res.type('text/html');
        res.end(html);
    } catch (error) {
        if(!isProd){
            console.log(req.url);
            console.log(error);
        }
        if (error.code === 404) {
            res.status(404).end('Page not found');
        } else {
            if(isProd)
                Sentry.captureException(error);
            res.status(500).end('Internal Server Error');
        }
    }
});

//server.use(express.static('dist-client'));

server.listen(port, () => console.log('app listening on port: ' + port));