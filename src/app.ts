//@ts-ignore
window.global ||= window;
import App from "./App.vue";
import Vue from "vue";
import { createRouter } from "./router";
import "./assets/custom.scss";
import Meta from "vue-meta";
import * as Sentry from "@sentry/browser";
import "./assets/global.css";
import VueScrollTo from "vue-scrollto";
import { Vue as VueIntegration } from "@sentry/integrations";
import Multiselect from "vue-multiselect";
import { ResizeObserver as ResizeObserverPolyfill } from "@juggle/resize-observer";

const isProd = import.meta.env.PROD;

Vue.config.productionTip = false;

if (isProd) {
  Sentry.init({
    dsn: import.meta.env.VUE_APP_SENTRY_DSN,
    integrations: [new VueIntegration({ Vue, attachProps: true })],
  });
}

if (typeof window !== "undefined") {
  //needed for chartjs3.x compatibility with older browsers
  window.ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill;
}

Vue.use(Meta);
Vue.use(VueScrollTo);
Vue.component("MultiSelect", Multiselect);

const router = createRouter();

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
