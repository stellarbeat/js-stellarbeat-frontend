import Vue from 'vue';
import Router from 'vue-router';
import Network from './views/Network.vue';
import Nodes from './views/Nodes.vue';
import Organizations from './views/Organizations.vue';
import OrganizationDetails from './views/OrganizationsDetails.vue';
import FAQ from './views/FAQ.vue';
import Api from './views/Api.vue';
import TermsAndConditions from './views/TermsAndConditions.vue';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {name: 'network', path: '/', component: Network,
            children: [
                {
                    name: 'network-node',
                    path: '/networks/public/nodes/:publicKey',
                    component: Network,
                },
            ],
        },
        {name: 'nodes', path: '/nodes', component: Nodes},
        {name: 'organizations', path: '/organizations', component: Organizations},
        //{name: 'node-details', path: '/nodes/:publicKey', component: NodeDetails},
        {name: 'organization-details', path: '/organizations/:organizationId', component: OrganizationDetails},

        {name: 'faq', path: '/faq', component: FAQ, meta: {fullPreRender: true}},
        {name: 'api', path: '/api', component: Api, meta: {fullPreRender: true}},
        {name: 'terms-and-conditions', path: '/terms-and-conditions', component: TermsAndConditions, meta: {fullPreRender: true}},
        {//backwards compatibility
            path: '/quorum-monitor', name: 'quorum-monitor', component: Network,
            children: [
                {
                    name: 'quorum-monitor-node',
                    path: ':publicKey',
                    component: Network,
                },
            ],
        }
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
