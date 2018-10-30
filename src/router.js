import Vue from 'vue'
import Router from 'vue-router'
import NodeExplorer from './components/node/node-explorer.vue';
import Manual from './components/manual.vue';
import Home from './views/Home.vue';
import QuorumMonitor from './views/QuorumMonitor.vue';
import Nodes from './views/Nodes';
import NodeDetails from './views/NodeDetails';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
      {name: 'home', path: '/', component: Home},
      {name: 'nodes', path: '/nodes', component: Nodes},
      {name: 'node-details', path: '/nodes/:publicKey', component: NodeDetails},
      {
          path: '/quorum-monitor', component: QuorumMonitor,
          children: [
              {
                  name: 'quorum-monitor', path: '', component: Manual
              },
              {
                  name: 'quorum-monitor-node',
                  path: ':publicKey',
                  component: NodeExplorer
              }
          ]
      }
  ]
})
