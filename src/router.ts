import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import Nodes from './views/Nodes.vue';
import Organizations from './views/Organizations.vue';
import OrganizationDetails from './views/OrganizationsDetails.vue';
import FAQ from './views/FAQ.vue';
import Api from './views/Api.vue';
import TermsAndConditions from './views/TermsAndConditions.vue';
import NetworkDashboard from '@/components/network/network-dashboard.vue';
import NodeDashboard from '@/components/node/node-dashboard.vue';
import NetworkSideBar from '@/components/side-bar/network/network-side-bar.vue';
import NodeSideBar from '@/components/side-bar/node/node-side-bar.vue';
import OrganizationDashboard from '@/components/organization/organization-dashboard.vue';
import OrganizationSideBar from '@/components/side-bar/organization/organization-side-bar.vue';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {path: '/', component: Dashboard, alias: '/quorum-monitor',
            children: [
                {
                    name: 'network-dashboard',
                    path: '',
                    alias: ['network', 'quorum-monitor'],
                    components: {
                        dashboard: NetworkDashboard,
                        sideBar: NetworkSideBar
                    },
                },
                {
                    name: 'node-dashboard',
                    path: 'nodes/:publicKey',
                    alias: 'quorum-monitor/:publicKey',
                    components: {
                        dashboard: NodeDashboard,
                        sideBar: NodeSideBar
                    },
                },
                {
                    name: 'organization-dashboard',
                    path: 'organizations/:organizationId',
                    components: {
                        dashboard: OrganizationDashboard,
                        sideBar: OrganizationSideBar
                    },
                },
            ],
        },
        {name: 'nodes', path: '/nodes', component: Nodes},
        {name: 'organizations', path: '/organizations', component: Organizations},

        {name: 'faq', path: '/faq', component: FAQ, meta: {fullPreRender: true}},
        {name: 'api', path: '/api', component: Api, meta: {fullPreRender: true}},
        {name: 'terms-and-conditions', path: '/terms-and-conditions', component: TermsAndConditions, meta: {fullPreRender: true}}
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
