import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import FAQ from './views/FAQ.vue';
import Api from './views/Api.vue';
import TermsAndConditions from './views/TermsAndConditions.vue';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {path: '/', component: Dashboard, alias: '/quorum-monitor/:view?', props: (route) => ({ view: route.query.view }),
            children: [
                {
                    name: 'network-dashboard',
                    path: '',
                    alias: ['network', 'quorum-monitor'],
                    components: {
                        dashboard: () => import(/* webpackChunkName: "network-dashboard" */ '@/components/network/network-dashboard.vue') as any,
                        sideBar: () => import(/* webpackChunkName: "network-dashboard" */ '@/components/network/sidebar/network-side-bar.vue') as any
                    },
                    props: (route) => ({ view: route.query.view }),
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
        {name: 'nodes', path: '/nodes', component: () => import(/* webpackChunkName: "nodes" */ '@/views/Nodes.vue') as any},
        {name: 'organizations', path: '/organizations', component: () => import(/* webpackChunkName: "organizations" */ '@/views/Organizations.vue') as any},

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
