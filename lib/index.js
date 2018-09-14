//
let Vue = require('vue');
let App = require('./views/app.vue');

new Vue({
    el: '#app',
    render: function (createElement) {
        return createElement(App)
    }
});