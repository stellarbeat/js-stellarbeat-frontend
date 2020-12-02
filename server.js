const path = require('path');
const express = require('express');
const server = express();
const template = require('fs').readFileSync('./public/ssr-template.html', 'utf-8');
const clientManifest = require('./dist-client/vue-ssr-client-manifest.json');
const { createBundleRenderer } = require('vue-server-renderer');
const serverBundle = require('./dist-server/vue-ssr-server-bundle.json')
let port = process.env.PORT || 3000;
const LRU = require("lru-cache");

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

server.get("*", async (req, res) => {
    try {
        console.log(req.url);
        const hit = microCache.get(req.url)
        if (hit) {
            return res.end(hit)
        }

        const renderer = createBundleRenderer(serverBundle, {
            runInNewContext: false, // recommended
            template, // (optional) page template
            clientManifest // (optional) client build manifest
        })
        let html = await renderer.renderToString({url: req.url});
        microCache.set(req.url, html);
        res.end(html);
    } catch (error) {
        console.log(error);
        res.end(404);
    }
});

//server.use(express.static('dist-client'));

server.listen(port, () => console.log('app listening on port: ' + port));