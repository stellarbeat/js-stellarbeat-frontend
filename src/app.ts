import App from "./App.vue";
import Vue from "vue";
import { createRouter } from "./router";
import "./assets/custom.scss";
import "./assets/global.css";
import Multiselect from "vue-multiselect";
import * as Sentry from "@sentry/vue";
import "bootstrap/js/dist/dropdown";
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/tooltip";
import "bootstrap/js/dist/modal";
import PortalVue from "portal-vue";
import ToolTipDirective from "./directives/tooltip";

//@ts-ignore
window.global ||= window;

const isProd = import.meta.env.PROD;

Vue.config.productionTip = false;

if (isProd) {
  Sentry.init({
    Vue,
    dsn: import.meta.env.VUE_APP_SENTRY_DSN,
  });
}
Vue.use(PortalVue);

Vue.component("MultiSelect", Multiselect);
Vue.directive("tooltip", ToolTipDirective);

const router = createRouter();

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
