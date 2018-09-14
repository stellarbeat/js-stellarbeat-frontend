const Network = require('./entities/network');
const Vue = require('vue');
const Node = require('./entities/node');
const VueTruncate = require('vue-truncate-filter');
const Request = require('./services/request-async');
const FaSvgCore = require('@fortawesome/fontawesome-svg-core');
const FaFree = require('@fortawesome/free-solid-svg-icons');
const VueFontAwesome = require('@fortawesome/vue-fontawesome');
const _ = require('lodash');

require("babel-polyfill"); //add missing nodejs functionality

$(document).ready(function () {
    main();
});

async function main(){
    let App = require('./views/app.vue');

    Vue.use(VueTruncate);
    FaSvgCore.library.add(FaFree.faPowerOff, FaFree.faInfo, FaFree.faSun);
    Vue.component('font-awesome-icon', VueFontAwesome.FontAwesomeIcon);

    //let nodesJson = await fetchData(); //document.getElementById('nodes-seed').innerHTML;
    let nodesJson = document.getElementById('nodes-seed').innerHTML;
    let nodesRaw = JSON.parse(nodesJson);
    let nodes = nodesRaw.map(node => Node.fromJSON(node));
    let sortedNodes = _.sortBy(nodes, ['ip', 'dateUpdated']);

    let network = new Network(nodes);

    new Vue({
        el: '#app',
        data: {
            network: network
        },
        template: '<App :network="network"/>',
        components: {App}
    });
}
async function fetchData(){
    return await Request.getHttpsGetPromise('stellarbeat.io', '/nodes/raw');
}