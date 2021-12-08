<template>
  <div id="app" class="page full">
    <div class="flex-fill">
      <navbar
        brand-tag-line="Stellar network visibility"
        brand-name="Stellarbeat.io"
        :brand-image="{ alt: 'stellarbeat.io', src: 'logo.svg' }"
      ></navbar>
      <div class="container-fluid h-100 mt-0 mt-md-2" style="max-width: 1360px">
        <b-alert :show="showError" variant="danger">{{ errorMessage }}</b-alert>
        <b-alert :show="store.isLocalNetwork" variant="info"
          >Learn more about the demo networks
          <a
            href="https://medium.com/stellarbeatio/stellar-fbas-intuition-5b8018f58f3e"
            target="_blank"
            rel="noopener"
            >here!</a
          ></b-alert
        >
        <div v-if="store.isLoading" class="d-flex justify-content-center mt-5">
          <div class="loader"></div>
        </div>
        <div v-else>
          <router-view
            v-if="!store.isLoading && !store.fetchingDataFailed"
            :isLoading="store.isLoading"
          />
          <custom-network></custom-network>
        </div>
      </div>
    </div>
    <footer class="footer">
      <div class="container-fluid" style="max-width: 1360px">
        <div class="d-flex justify-content-between mx-4">
          <router-link
            active-class="active"
            class="nav-link"
            :to="{
              name: 'terms-and-conditions',
              query: {
                view: $route.query.view,
                network: $route.query.network,
                at: $route.query.at,
              },
            }"
            exact
          >
            Terms and Conditions
          </router-link>
          <div class="nav-item d-none d-lg-flex pr-0">
            <a
              href="https://github.com/stellarbeat"
              class="btn btn-sm bt btn-primary-sb"
              target="_blank"
              rel="noopener"
            >
              <github />
              Github</a
            >
            <a
              href="mailto:info@stellarbeat.io"
              rel="noopener"
              class="btn btn-sm bt btn-primary-sb ml-2"
              target="_blank"
            >
              <b-icon-envelope />
              Mail</a
            >
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import Navbar from "@/components/layout/Navbar.vue";
import Github from "@/components/organization/logo/github.vue";
import CustomNetwork from "@/components/network/tools/modify-network.vue";
import { BAlert, BIconEnvelope } from "bootstrap-vue";
import Store from "@/store/Store";
import { isString } from "@stellarbeat/js-stellar-domain/lib/typeguards";
import {
  ComputedRef,
  nextTick,
  defineComponent,
  computed,
  onBeforeMount,
  watch,
} from "@vue/composition-api";
import { useRoute } from "vue2-helpers/vue-router";
import useStore from "@/store/useStore";

export default defineComponent({
  components: {
    Github,
    CustomNetwork,
    BAlert,
    BIconEnvelope,
    Navbar,
  },
  metaInfo: {
    title: "Stellarbeat.io - Stellar network visibility",
    meta: [
      {
        name: "description",
        content:
          "Giving insight into the Stellar network through various tools & visualizations.",
      },
    ],
  },

  setup() {
    const errorMessage =
      "Could not connect to stellarbeat.io api, please refresh the page";
    const navCollapsed = false;
    const enableNotify = process.env.VUE_APP_ENABLE_NOTIFY === "1";

    const store: ComputedRef<Store> = computed(() => useStore());
    const route = useRoute();

    onBeforeMount(async () => {
      let networkId = route.query.network;
      if (
        "string" === typeof networkId &&
        store.value.availableNetworks.includes(networkId)
      ) {
        store.value.networkId = networkId;
      }
      let timeAt = store.value.getDateFromParam(route.query.at);
      await store.value.initializeNetwork(timeAt);
    });

    const network = computed(() => store.value.network);

    const showError = computed(() => store.value.fetchingDataFailed);

    const networkQuery = computed(() => route.query.network);
    const at = computed(() => route.query.at);

    watch(
      [networkQuery, at],
      async (to) => {
        const networkQuery = to[0];
        const at = to[1];
        let networkId = store.value.networkId;
        let timeTravelDate = store.value.getDateFromParam(at);
        let timeTravel = false;
        if (!timeTravelDate && store.value.isTimeTravel)
          //time travel reset
          timeTravel = true;
        if (timeTravelDate && !store.value.timeTravelDate) timeTravel = true;
        if (
          timeTravelDate &&
          store.value.timeTravelDate &&
          timeTravelDate.getTime() !== store.value.timeTravelDate.getTime()
        )
          timeTravel = true;

        if (
          isString(networkQuery) &&
          store.value.availableNetworks.includes(networkQuery)
        )
          networkId = networkQuery;

        if (networkId !== store.value.networkId || timeTravel) {
          store.value.networkId = networkId;
          store.value.isLoading = true;
          await nextTick(async () => {
            //next tick is needed to toggle the loading state. The loading state is needed to clean up the previous gui.
            await store.value.initializeNetwork(
              timeTravel ? timeTravelDate : undefined
            );
          });
        }
      },
      { immediate: false }
    );

    return {
      errorMessage,
      navCollapsed,
      enableNotify,
      store,
      network,
      showError,
    };
  },
});
/*export default class App extends Vue {





}*/
</script>

<style scoped>
.action-bar {
  background-color: #eaebed;
  padding: 2px;
}

.full {
  background: #f5f7fb;
}

.brand-title {
  color: #44bbe7;
}

.collapser {
  background: white;
}

.my-header {
  width: 100%;
}

.my-navbar-toggle {
  border: none;
}
</style>

<style>
.gray {
  color: #80858a !important;
}
</style>
