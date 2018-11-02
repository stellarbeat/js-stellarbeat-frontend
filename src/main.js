import Vue from 'vue';
import App from './App.vue';
import router from './router';

const d3 = require("d3");

Vue.config.productionTip = false;

const VueTruncate = require('vue-truncate-filter');

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'tabler-ui/dist/assets/css/tabler.css';
import 'tabler-ui/dist/assets/css/dashboard.css';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import BootstrapVue from 'bootstrap-vue';

main();

async function main() {
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
}