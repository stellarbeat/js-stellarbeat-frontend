import Vue from "vue";
import Router from "vue-router";
import Dashboard from "./views/Dashboard.vue";

Vue.use(Router);

export function createRouter() {
  return new Router({
    mode: "history",
    base: process.env.BASE_URL,
    routes: [
      {
        path: "/",
        component: Dashboard,
        alias: ["/quorum-monitor/:view?"],
        props: (route) => ({ view: route.query.view }),
        children: [
          {
            name: "network-dashboard",
            path: "/",
            alias: ["/network/stellar-public", "quorum-monitor"],
            components: {
              dashboard: () =>
                import(
                  /* webpackChunkName: "network-dashboard" */ "@/components/network/network-dashboard.vue"
                ),
              sideBar: () =>
                import(
                  /* webpackChunkName: "network-dashboard" */ "@/components/network/sidebar/network-side-bar.vue"
                ),
            },
            props: (route) => ({ view: route.query.view }),
            children: [],
          },
          {
            name: "node-dashboard",
            path: "nodes/:publicKey",
            alias: "quorum-monitor/:publicKey",
            components: {
              dashboard: () =>
                import(
                  /* webpackChunkName: "node-dashboard" */ "@/components/node/node-dashboard.vue"
                ),
              sideBar: () =>
                import(
                  /* webpackChunkName: "node-dashboard" */ "@/components/node/sidebar/node-side-bar.vue"
                ),
            },
            props: (route) => ({ view: route.query.view }),
          },
          {
            name: "organization-dashboard",
            path: "organizations/:organizationId",
            components: {
              dashboard: () =>
                import(
                  /* webpackChunkName: "organization-dashboard" */ "@/components/organization/organization-dashboard.vue"
                ),
              sideBar: () =>
                import(
                  /* webpackChunkName: "organization-dashboard" */ "@/components/organization/sidebar/organization-side-bar.vue"
                ),
            },
            props: (route) => ({ view: route.query.view }),
          },
        ],
      },
      {
        name: "nodes",
        path: "/nodes",
        component: () =>
          import(/* webpackChunkName: "nodes" */ "@/views/Nodes.vue"),
      },
      {
        name: "organizations",
        path: "/organizations",
        component: () =>
          import(
            /* webpackChunkName: "organizations" */ "@/views/Organizations.vue"
          ),
      },

      {
        name: "faq",
        path: "/faq",
        component: () =>
          import(/* webpackChunkName: "faq" */ "@/views/FAQ.vue"),
      },
      {
        name: "api",
        path: "/api",
        component: () =>
          import(/* webpackChunkName: "api" */ "@/views/Api.vue"),
      },
      {
        path: "/notify",
        component: () =>
          import(/* webpackChunkName: "api" */ "@/views/Notify.vue"),

        children: [
          {
            name: "subscribe",
            path: "",
            component: () =>
              import(
                /* webpackChunkName: "notify-subscribe" */ "@/components/notify/subscribe.vue"
              ),
          },
          {
            name: "confirm",
            path: ":pendingSubscriptionId/confirm",
            component: () =>
              import(
                /* webpackChunkName: "notify-subscription-confirmed" */ "@/components/notify/confirm.vue"
              ),
          },
        ],
      },
      {
        name: "terms-and-conditions",
        path: "/terms-and-conditions",
        component: () =>
          import(
            /* webpackChunkName: "tac" */ "@/views/TermsAndConditions.vue"
          ),
      },
    ],

    scrollBehavior(to, from, savedPosition) {
      if (to.query["no-scroll"] === "1") {
        return;
      }

      // default we scroll to top or use history
      if (savedPosition) {
        return savedPosition;
      } else {
        return { x: 0, y: 0 };
      }
    },
  });
}
