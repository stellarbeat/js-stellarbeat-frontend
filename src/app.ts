import Vue from "vue";
import App from "./App.vue";
import { createRouter } from "./router";
import VueTruncate from "vue-truncate-filter";
import "./assets/custom.scss";
import Meta from "vue-meta";
import * as Sentry from "@sentry/browser";
import "@/assets/global.css";
import VueScrollTo from "vue-scrollto";
import VueClipboard from "vue-clipboard2";
import "core-js/stable";
import "regenerator-runtime/runtime";
import { Vue as VueIntegration } from "@sentry/integrations";
import Multiselect from "vue-multiselect";
import { ResizeObserver as ResizeObserverPolyfill } from "@juggle/resize-observer";

const isProd = process.env.NODE_ENV === "production";

Vue.config.productionTip = false;

if (isProd) {
  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_DSN,
    integrations: [new VueIntegration({ Vue, attachProps: true })],
  });
}

if (typeof window !== "undefined") {
  //needed for chartjs3.x compatibility with older browsers
  window.ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill;
}

VueClipboard.config.autoSetContainer = true;
Vue.use(VueClipboard);
Vue.use(VueTruncate);
Vue.use(Meta);
Vue.use(VueScrollTo);
Vue.component("multi-select", Multiselect);

const router = createRouter();

const createApp = () => {
  const app = new Vue({
    router,
    render: (h) => h(App),
    mounted() {
      document.dispatchEvent(new Event("x-app-rendered"));
    },
  });

  return { app, router };
};

export default createApp;
