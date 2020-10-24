import Vue from 'vue';
import Router, {Route} from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import FAQ from './views/FAQ.vue';
import Api from './views/Api.vue';
import TermsAndConditions from './views/TermsAndConditions.vue';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/', redirect: '/network/stellar-public', alias: ['/quorum-monitor']
        },
        {
            path: '/nodes/:publicKey', redirect: '/network/stellar-public/nodes/:publicKey', alias: '/quorum-monitor/:publicKey'
        },
        {
            path: '/organizations/:organizationId', redirect: '/network/stellar-public/organizations/:organizationId'
        },
        {
            path: '/nodes', redirect: '/network/stellar-public/nodes'
        },
        {
            path: '/organizations', redirect: '/network/stellar-public/organizations'
        },
        {path: '/network/:networkId', component: Dashboard, alias: ['/quorum-monitor/:view?'], props: (route) => ({ view: route.query.view }),
            children: [
                {
                    name: 'network-dashboard',
                    path: '/',
                    components: {
                        dashboard: () => import(/* webpackChunkName: "network-dashboard" */ '@/components/network/network-dashboard.vue') as any,
                        sideBar: () => import(/* webpackChunkName: "network-dashboard" */ '@/components/network/sidebar/network-side-bar.vue') as any
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
                        dashboard: () => import(/* webpackChunkName: "node-dashboard" */ '@/components/node/node-dashboard.vue') as any,
                        sideBar: () => import(/* webpackChunkName: "node-dashboard" */ '@/components/node/sidebar/node-side-bar.vue') as any
                    },
                    props: (route) => ({ view: route.query.view }),
                },
                {
                    name: 'organization-dashboard',
                    path: 'organizations/:organizationId',
                    components: {
                        dashboard: () => import(/* webpackChunkName: "organization-dashboard" */ '@/components/organization/organization-dashboard.vue') as any,
                        sideBar: () => import(/* webpackChunkName: "organization-dashboard" */ '@/components/organization/sidebar/organization-side-bar.vue') as any
                    },
                    props: (route) => ({ view: route.query.view }),
                },
            ],
        },
        {name: 'nodes', path: '/network/:networkId/nodes', component: () => import(/* webpackChunkName: "nodes" */ '@/views/Nodes.vue') as any},
        {name: 'organizations', path: '/network/:networkId/organizations', component: () => import(/* webpackChunkName: "organizations" */ '@/views/Organizations.vue') as any},

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
