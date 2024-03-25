//@ts-ignore
window.global ||= window;
import App from "./App.vue";
import Vue from "vue";
import { createRouter } from "./router";
import "./assets/custom.scss";
import "./assets/global.css";
import Multiselect from "vue-multiselect";
import * as Sentry from "@sentry/vue";

const isProd = import.meta.env.PROD;

Vue.config.productionTip = false;

if (isProd) {
  Sentry.init({
    dsn: import.meta.env.VUE_APP_SENTRY_DSN,
  });
}

Vue.component("MultiSelect", Multiselect);

const router = createRouter();

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
