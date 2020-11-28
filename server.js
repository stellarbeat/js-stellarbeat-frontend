const express = require('express');
const app = express();
const history = require('connect-history-api-fallback');
const Vue = require('vue');
import App from './App.vue';
import router from './router';
import VueTruncate from 'vue-truncate-filter';
import './assets/tabler-ui-light.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import Meta from 'vue-meta';
import * as Sentry from '@sentry/browser';
// Importing the global css file
import "@/assets/global.css"
import VueScrollTo from 'vue-scrollto';
import Store from '@/store/Store';
import VueClipboard from 'vue-clipboard2'
import "core-js/stable";
import "regenerator-runtime/runtime";
import { Vue as VueIntegration } from '@sentry/integrations';
import AsyncComputedPlugin from 'vue-async-computed';

const isProd = process.env.NODE_ENV === 'production';

Vue.config.productionTip = false;

if (isProd) {
    Sentry.init({
        dsn: process.env.VUE_APP_SENTRY_DSN,
        integrations: [new VueIntegration({Vue, attachProps: true})],
    });
} else {
    //makeServer();
}

Vue.use(AsyncComputedPlugin)
Vue.use(VueClipboard);
Vue.use(VueTruncate);
Vue.use(Meta);
Vue.use(VueScrollTo);

new Vue({
    router,
    data() {
        return {
            'store': new Store()
        }
    },
    render: h => h(App),
    mounted() {
        document.dispatchEvent(new Event('x-app-rendered'));
    },
}).$mount('#app');


let port = process.env.PORT || 3000;

app.use(history({
    rewrites: [
        { from: /\/faq/, to: '/faq.html'},
        { from: /\/api/, to: '/api.html'},
        { from: /\/terms-and-conditions/, to: '/terms-and-conditions.html'}
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

app.use(express.static('dist'));

app.listen(port, () => console.log('app listening on port: ' + port));