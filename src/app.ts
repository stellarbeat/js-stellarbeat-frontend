import Vue from 'vue';
import App from './App.vue';
import {createRouter} from './router';
import VueTruncate from 'vue-truncate-filter';
//import './assets/tabler-ui-light.css';
import './assets/custom.scss';
import Meta from 'vue-meta';
import * as Sentry from '@sentry/browser';
// Importing the global css file
import '@/assets/global.css';
import VueScrollTo from 'vue-scrollto';
import Store from '@/store/Store';
import VueClipboard from 'vue-clipboard2';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {Vue as VueIntegration} from '@sentry/integrations';
import {Network} from '@stellarbeat/js-stellar-domain';
//import AsyncComputedPlugin from 'vue-async-computed';

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

//Vue.use(AsyncComputedPlugin);
VueClipboard.config.autoSetContainer = true
Vue.use(VueClipboard);
Vue.use(VueTruncate);
Vue.use(Meta);
Vue.use(VueScrollTo);

const router = createRouter();

let createApp = () => {
    const store = new Store();

    const app = new Vue({
        router,
        data() {
            return {
                'store': store
            };
        },
        render: h => h(App),
        mounted() {
            document.dispatchEvent(new Event('x-app-rendered'));
        },
    });

    return { app, router, store }
};

export default createApp;