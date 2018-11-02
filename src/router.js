import Vue from 'vue'
import Router from 'vue-router'
import QuorumSetExplorer from './components/quorum-monitor/quorum-set-explorer/quorum-set-explorer.vue';
import Manual from './components/quorum-monitor/manual.vue';
import Home from './views/Home.vue';
import QuorumMonitor from './views/QuorumMonitor.vue';
import Nodes from './views/Nodes';
import NodeDetails from './views/NodeDetails';
import About from './views/About';
import Api from './views/Api';


Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
      {name: 'home', path: '/', component: Home},
      {name: 'nodes', path: '/nodes', component: Nodes},
      {name: 'node-details', path: '/nodes/:publicKey', component: NodeDetails},
      {name: 'about', path: '/about', component: About, meta: { fullPreRender: true }},
      {name: 'api', path: '/api', component: Api, meta: { fullPreRender: true }},
      {
          path: '/quorum-monitor', component: QuorumMonitor,
          children: [
              {
                  name: 'quorum-monitor', path: '', component: Manual
              },
              {
                  name: 'quorum-monitor-node',
                  path: ':publicKey',
                  component: QuorumSetExplorer
              }
          ]
      }
  ],
    scrollBehavior (to, from, savedPosition) {
      if(to.query["no-scroll"]) {
          return;
      }

      //default we scroll to top or use history
      if (savedPosition) {
          return savedPosition
      } else {
          return { x: 0, y: 0 }
      }
    }

})
