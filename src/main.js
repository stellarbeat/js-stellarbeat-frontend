import Vue from 'vue';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

const Network = require('@stellarbeat/js-stellar-domain').Network;
const Node = require('@stellarbeat/js-stellar-domain').Node;
const VueTruncate = require('vue-truncate-filter');
const FaSvgCore = require('@fortawesome/fontawesome-svg-core');
const FaFree = require('@fortawesome/free-solid-svg-icons');
const VueFontAwesome = require('@fortawesome/vue-fontawesome');
const axios = require('axios');

import 'bootstrap/dist/css/bootstrap.css';
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

    /*let data = await fetchData();
    let nodesRaw = data.data;
    let nodes = nodesRaw.map(node => Node.fromJSON(node));

    let network = new Network(nodes);*/


    FaSvgCore.library.add(FaFree.faPowerOff, FaFree.faInfo, FaFree.faSun, FaFree.faSpinner, FaFree.faCaretDown, FaFree.faCaretRight, FaFree.faArrowCircleLeft, FaFree.faArrowCircleRight);
    Vue.component('font-awesome-icon', VueFontAwesome.FontAwesomeIcon);

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

async function fetchData() {
    return await axios.get('https://stellarbeat-backend-staging.herokuapp.com/api/v1/nodes');
}