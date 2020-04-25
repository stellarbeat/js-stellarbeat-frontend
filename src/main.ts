import Vue from 'vue';
import App from './App.vue';
import router from './router';
import SimpleAnalytics from "simple-analytics-vue";
import VueTruncate from 'vue-truncate-filter';
import './assets/tabler-ui-light.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import Meta from 'vue-meta';
import * as Sentry from '@sentry/browser';
// Importing the global css file
import "@/assets/global.css"
import VueScrollTo from 'vue-scrollto';
import Store from '@/store/Store';
import VueClipboard from 'vue-clipboard2'
import "core-js/stable";
import "regenerator-runtime/runtime";
import {makeServer} from '@/server';
import 'leaflet/dist/leaflet.css';
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const isProd = process.env.NODE_ENV === 'production';

Vue.config.productionTip = false;

if (isProd) {
    Sentry.init({
        dsn: process.env.VUE_APP_SENTRY_DSN,
        integrations: [new Sentry.Integrations.Vue({Vue})],
    });
} else {
    //makeServer();
}

Vue.use(VueClipboard);
Vue.use(VueTruncate);
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.use(Meta);
Vue.use(SimpleAnalytics, { skip: !isProd });
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
