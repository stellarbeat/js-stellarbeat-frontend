import Vue from 'vue';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

const VueTruncate = require('vue-truncate-filter');

//import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'tabler-ui/dist/assets/css/dashboard.css';

import BootstrapVue from 'bootstrap-vue';

if(process.env.VUE_APP_ENABLE_SENTRY) {
    const Sentry = require('@sentry/browser');
    Sentry.init({
        dsn: process.env.VUE_APP_SENTRY_DNS,
        integrations: [new Sentry.Integrations.Vue({ Vue })]
    })
}
Vue.use(VueTruncate);
Vue.use(BootstrapVue);

new Vue({
    router,
    render(createElement) {
        return createElement(App/*, {
                props: {
                    network: network
                }
            }*/)
    },
    mounted() {
        document.dispatchEvent(new Event("x-app-rendered"));
    },
}).$mount('#app');
