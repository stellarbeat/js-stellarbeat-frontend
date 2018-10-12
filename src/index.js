// @flow
const Network = require('@stellarbeat/js-stellar-domain').Network;
const Vue = require('vue');
const Node = require('@stellarbeat/js-stellar-domain').Node;
const VueTruncate = require('vue-truncate-filter');
const Request = require('./services/request-async');
const FaSvgCore = require('@fortawesome/fontawesome-svg-core');
const FaFree = require('@fortawesome/free-solid-svg-icons');
const VueFontAwesome = require('@fortawesome/vue-fontawesome');
const VueRouter = require('vue-router');

$(document).ready(function () {
    main();
});

async function main() {
    Vue.use(VueTruncate);
    Vue.use(VueRouter);

    const App = require('./views/app.vue');
    const NodeExplorer = require('./views/node/node-explorer.vue');
    const Manual = require('./views/manual.vue');


    //let nodesJson = await fetchData(); //document.getElementById('nodes-seed').innerHTML;
    let nodesSeedElement = document.getElementById('nodes-seed');
    if(!nodesSeedElement)
        return;

    let nodesJson = await fetchData(); //nodesSeedElement.innerHTML;
    let nodesRaw = JSON.parse(nodesJson);
    let nodes = nodesRaw.map(node => Node.fromJSON(node));

    let network = new Network(nodes);

    const routes = [
        { path: '/', redirect: '/manual'},
        {name: 'manual', path: '/manual', component: Manual},
        {name: 'node', path: '/node/:publicKey', component: NodeExplorer, props: {network: network}}
    ];

    const router = new VueRouter({
        routes // short for `routes: routes`
    });


    FaSvgCore.library.add(FaFree.faPowerOff, FaFree.faInfo, FaFree.faSun, FaFree.faSpinner, FaFree.faCaretDown, FaFree.faCaretRight, FaFree.faArrowCircleLeft, FaFree.faArrowCircleRight);
    Vue.component('font-awesome-icon', VueFontAwesome.FontAwesomeIcon);


    //let computeGraphWorker = new Worker('./workers/compute-graph');
    new Vue({
        el: '#app',
        data: {
            network: network,
        },
        template: '<App :network="network"/>',
        components: {App},
        router
    });
}

async function fetchData() {
    return await Request.getHttpsGetPromise('stellarbeat-crawler.herokuapp.com', '/nodes');
}