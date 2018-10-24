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
const BootstrapVue = require('bootstrap-vue');

$(document).ready(function () {
    main();
});

async function main() {
    Vue.use(VueTruncate);
    Vue.use(VueRouter);
    Vue.use(BootstrapVue);

    const App = require('./views/app.vue');
    const NodeExplorer = require('./views/node/node-explorer.vue');
    const Manual = require('./views/manual.vue');
    const HomePage = require('./views/home.vue');
    const QuorumMonitorPage = require('./views/quorum-monitor.vue');
    const NodesTable = require('./views/nodes-table.vue');
    const NodeInfo = require('./views/node-info.vue');

    let nodesJson = await fetchData();
    let nodesRaw = JSON.parse(nodesJson);
    let nodes = nodesRaw.map(node => Node.fromJSON(node));

    let network = new Network(nodes);

    /*const routes = [
        { path: '/', redirect: '/manual'},
        {name: 'manual', path: '/manual', component: Manual},
        {name: 'node', path: '/node/:publicKey', component: NodeExplorer, props: {network: network}}
    ];*/
    const routes = [
        {path: '/', redirect: {name: 'home'}},
        {name: 'home', path: '/home', component: HomePage, props: {network: network}},
        {name: 'nodes-table', path: '/nodes', component: NodesTable, props: {network: network}},
        {name: 'node-info', path: '/nodes/:publicKey', component: NodeInfo, props: {network: network}},
        {
            name: 'quorum-monitor', path: '/quorum-monitor', component: QuorumMonitorPage, props: {network: network},
            default: 'quorum-monitor-manual',
            children: [
                {
                    name: 'default', path: '', component: Manual
                },
                {
                    name: 'quorum-monitor-manual', path: 'manual', component: Manual
                },
                {
                    name: 'quorum-monitor-node',
                    path: 'nodes/:publicKey',
                    component: NodeExplorer,
                    props: {network: network}
                }

            ]
        }
    ];

    const router = new VueRouter({
        //mode: 'history',
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
    return await Request.getHttpsGetPromise('stellarbeat-backend-staging.herokuapp.com', '/api/v1/nodes');
}