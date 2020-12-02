import Vue from 'vue';
import Router, {Route} from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import FAQ from './views/FAQ.vue';
import Api from './views/Api.vue';
import TermsAndConditions from './views/TermsAndConditions.vue';
import NetworkDashboard from '@/components/network/network-dashboard.vue';
import NetworkSideBar from '@/components/network/sidebar/network-side-bar.vue';
import NodeDashboard from '@/components/node/node-dashboard.vue';
import NodeSideBar from '@/components/node/sidebar/node-side-bar.vue';
import OrganizationDashboard from '@/components/organization/organization-dashboard.vue';
import OrganizationSideBar from '@/components/organization/sidebar/organization-side-bar.vue';
import Nodes from '@/views/Nodes.vue';
import Organizations from '@/views/Organizations.vue';

Vue.use(Router);

export function createRouter () {
    return new Router({
        mode: 'history',
        base: process.env.BASE_URL,
        routes: [
            {path: '/', component: Dashboard, alias: ['/quorum-monitor/:view?'], props: (route) => ({ view: route.query.view }),
                children: [
                    {
                        name: 'network-dashboard',
                        path: '/',
                        alias: ['/network/stellar-public', 'quorum-monitor'],
                        components: {
                            dashboard: NetworkDashboard,
                            sideBar: NetworkSideBar
                        },
                        props: (route) => ({ view: route.query.view }),
                        children: [

                        ]
                    },
                    {
                        name: 'node-dashboard',
                        path: 'nodes/:publicKey',
                        alias: 'quorum-monitor/:publicKey',
                        components: {
                            dashboard: NodeDashboard,
                            sideBar: NodeSideBar
                        },
                        props: (route) => ({ view: route.query.view }),
                    },
                    {
                        name: 'organization-dashboard',
                        path: 'organizations/:organizationId',
                        components: {
                            dashboard: OrganizationDashboard,
                            sideBar: OrganizationSideBar
                        },
                        props: (route) => ({ view: route.query.view }),
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
}