import Vue from 'vue';
import Router from 'vue-router';
import QuorumSetExplorer from './components/quorum-monitor/quorum-set-explorer/quorum-set-explorer.vue';
import Manual from './components/quorum-monitor/manual.vue';
import SelectOrSimulateNodeAlert from './components/quorum-monitor/select-or-simulate-node-alert.vue';
import Home from './views/Home.vue';
import QuorumMonitor from './views/QuorumMonitor.vue';
import Nodes from './views/Nodes.vue';
import NodeDetails from './views/NodeDetails.vue';
import About from './views/About.vue';
import Help from './views/Help.vue';
import Api from './views/Api.vue';
import QuorumSetConnectionsGraph from './views/embeds/QuorumSetConnectionsGraph.vue';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {name: 'home', path: '/', component: Home},
        {name: 'nodes', path: '/nodes', component: Nodes},
        {name: 'node-details', path: '/nodes/:publicKey', component: NodeDetails},
        {name: 'help', path: '/help', component: Help, meta: {fullPreRender: true}},
        {name: 'about', path: '/about', component: About, meta: {fullPreRender: true}},
        {name: 'api', path: '/api', component: Api, meta: {fullPreRender: true}},
        {
            path: '/quorum-monitor', component: QuorumMonitor,
            children: [
                {
                    name: 'quorum-monitor', path: '', component: SelectOrSimulateNodeAlert,
                },
                {
                    name: 'quorum-monitor-node',
                    path: ':publicKey',
                    component: QuorumSetExplorer,
                },
            ],
        },
        {
            name: 'quorum-set-connections-graph',
            path: '/quorum-set-connections-graph',
            component: QuorumSetConnectionsGraph,
            meta: {isHeadlessRoute: true}
        },
    ],

    scrollBehavior(to, from, savedPosition) {
        if (to.query['no-scroll'] === '1') {
            return;
        }

        // default we scroll to top or use history
        if (savedPosition) {
            return savedPosition;
        } else {
            return {x: 0, y: 0};
        }
    },

});
