import Vue from 'vue';
import App from './App.vue';
import router from './router';
import VueAnalytics from 'vue-analytics';
import VueTruncate from 'vue-truncate-filter';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'tabler-ui/dist/assets/css/dashboard.css';
import BootstrapVue from 'bootstrap-vue';
import Meta from 'vue-meta';
import * as Sentry from '@sentry/browser';

const isProd = process.env.NODE_ENV === 'production';

if (process.env.VUE_APP_GA_ID) {
    Vue.use(VueAnalytics, {
        id: process.env.VUE_APP_GA_ID,
        router,
        debug: {
            enabled: process.env.VUE_APP_GA_DEBUG === '1',
            sendHitTask: isProd,
        },
    });
}

Vue.config.productionTip = false;

if (isProd) {
    Sentry.init({
        dsn: process.env.VUE_APP_SENTRY_DSN,
        integrations: [new Sentry.Integrations.Vue({Vue})],
    });
}
Vue.use(VueTruncate);
Vue.use(BootstrapVue);
Vue.use(Meta);

new Vue({
    router,
    render(createElement) {
        return createElement(App, /*, {
                props: {
                    network: network
                }
            }*/);
    },
    mounted() {
        document.dispatchEvent(new Event('x-app-rendered'));
    },
}).$mount('#app');
