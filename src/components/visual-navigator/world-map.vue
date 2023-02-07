<template>
  <div style="height: 100%">
    <l-map
      ref="myMap"
      :center="center"
      :zoom="zoom"
      :options="mapOptions"
      v-if="isMounted"
    >
      <l-tile-layer :url="url" :attribution="attribution" />
      <Vue2LeafletMarkerCluster :options="clusterOptions" ref="clusterRef">
        <LCircleMarker
          v-for="marker in markers"
          :lat-lng="marker.latLng"
          @click="nodeSelected(marker.node)"
          :key="marker.node.publicKey"
          :fillColor="marker.color"
          :fillOpacity="1"
          :color="getColor(marker)"
          :radius="7"
          :options="{
            publicKey: marker.node.publicKey,
            isNodeFailing: isNodeFailing(marker.node),
            organizationId: marker.node.organizationId,
          }"
        >
          <slot>lol</slot>
          <l-tooltip :options="{ permanent: false, interactive: true }">
            <div :id="marker.node.publicKey">
              <full-validator-title :node="marker.node" />
            </div>
          </l-tooltip>
        </LCircleMarker>
      </Vue2LeafletMarkerCluster>
    </l-map>
  </div>
</template>

<script setup lang="ts">
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import {
  computed,
  ComputedRef,
  defineProps,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { Node } from "@stellarbeat/js-stellar-domain";
import FullValidatorTitle from "@/components/node/full-validator-title.vue";
/* eslint-disable */
//ssr voodoo because leaflet uses window global only available in browser
let divIcon: any,
  latLng: any,
  icon: any,
  circleMarker: any,
  lBrowser: any,
  point: any;
let LCircleMarker: any, LMap: any, LMarker: any, LTileLayer: any, LTooltip: any;
let Vue2LeafletMarkerCluster: any;
let Vue2Leaflet: any;
const isBrowser = typeof window !== "undefined";
if (isBrowser) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const leaflet = require("leaflet");
  icon = leaflet.Icon;
  point = leaflet.point;
  divIcon = leaflet.divIcon;
  circleMarker = leaflet.circleMarker;
  lBrowser = leaflet.Browser;
  delete icon.Default.prototype._getIconUrl;
  icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  latLng = require("leaflet").latLng;
  require("leaflet-sleep");
  Vue2Leaflet = require("vue2-leaflet");
  LCircleMarker = Vue2Leaflet.LCircleMarker;
  LMap = Vue2Leaflet.LMap;
  LMarker = Vue2Leaflet.LMarker;
  LTileLayer = Vue2Leaflet.LTileLayer;
  LTooltip = Vue2Leaflet.LTooltip;
  Vue2LeafletMarkerCluster = require("vue2-leaflet-markercluster");
}
type Marker = {
  latLng: any;
  node: Node;
  color: string;
};

import useStore from "@/store/useStore";
import {useRoute, useRouter} from "vue-router/composables";

const props = defineProps({
  fullScreen: {
    type: Boolean,
    default: false,
  },
});

  const url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const attribution =
    '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors';
  const zoom = ref(2);
  const isMounted = ref(false);
  const store = useStore();
  const myMap = ref(null);
const clusterRef = ref(null);

const fullScreen = ref(props.fullScreen);

  onMounted(() => {
    isMounted.value = true;
  });


  watch(fullScreen, () => {
    (myMap.value as any).mapObject.invalidateSize();
    if (fullScreen.value) zoom.value = 3;
    else zoom.value = 2;
  });

  const selectedNode = computed(() => {
    return store.selectedNode;
  });

  watch(selectedNode,  () => {
    //not on initial load
    nextTick(() => {
      (clusterRef.value as any).mapObject.refreshClusters();
    });
  });

  const selectedOrganization = computed(() => {
    return store.selectedOrganization;
  });

  watch(selectedOrganization, () => {
    //not on initial load
    nextTick(() => {
      (clusterRef.value as any).mapObject.refreshClusters();
    });
  });

  const network = store.network;
  const route = useRoute();
  const router = useRouter();

  function isNodeFailing(node: Node) {
    return network.isNodeFailing(node);
  }

  const markers : ComputedRef<Marker[]>= computed(() => {
    return store.network.nodes
      .filter(store.watcherNodeFilter)
      .filter((node) => node.geoData.latitude)
      .map((geoNode) => {
        return {
          latLng: latLng(
            geoNode.geoData.latitude ? geoNode.geoData.latitude : 0,
            geoNode.geoData.longitude ? geoNode.geoData.longitude : 0
          ),
          node: geoNode,
          color: !network.isNodeFailing(geoNode) ? "#1997c6" : "#cd201f",
        };
      });
  });

  const center = computed(() => {
    if (
      selectedNode.value &&
      selectedNode.value.geoData.longitude &&
      selectedNode.value.geoData.latitude
    ) {
      return latLng(
       selectedNode.value.geoData.latitude
          ? selectedNode.value.geoData.latitude
          : 0,
        selectedNode.value.geoData.longitude
          ? selectedNode.value.geoData.latitude
          : 0
      );
    } else return latLng(25.505, -0.09);
  });

  function getColor(marker: Marker) {
    if (selectedNode.value && selectedNode.value === marker.node) return "yellow";

    if (
      selectedOrganization.value &&
      selectedOrganization.value.validators.includes(marker.node.publicKey)
    )
      return "yellow";

    return "white";
  }

  function nodeSelected(node: Node) {
    if (
      route.params.publicKey &&
      route.params.publicKey === node.publicKey
    )
      return;

    router.push({
      name: "node-dashboard",
      params: { publicKey: node.publicKey },
      query: {
        center: "1",
        "no-scroll": "1",
        view: route.query.view,
        network: route.query.network,
        at: route.query.at,
      },
    });
  }

  const clusterOptions = computed(() => {
    return {
      maxClusterRadius: 30,
      iconCreateFunction: (cluster: any) => {
        let markers: any[] = cluster.getAllChildMarkers();
        return divIcon({
          html: "<div><span>" + markers.length + "</span></div>",
          className: getMarkerClusterClasses(markers),
          iconSize: point(40, 40),
        });
      },
    };
  });


  function getMarkerClusterClasses(markers: any[]) {
    let classes: string[] = ["marker-cluster"];
    if (
      markers.filter((marker: any) => !marker.options.isNodeFailing).length ===
      0
    )
      classes.push("marker-cluster-failing");

    let isSelected = false;

    if (selectedNode.value)
      isSelected = markers.some(
        (marker: any) =>
          marker.options.publicKey === selectedNode.value?.publicKey
      );

    if (selectedOrganization.value)
      isSelected = markers.some(
        (marker: any) =>
          marker.options.organizationId === selectedOrganization.value?.id
      );

    if (isSelected) classes.push("marker-cluster-selected");

    return classes.join(" ");
  }

  const mapOptions = computed(() => {
    return {
      wakeTime: 250,
      sleepTime: 250,
      sleepNote: false,
      wakeMessage: false,
      sleepOpacity: 1,
      noBlockingAnimations: true,
    };
  });

  onBeforeUnmount(() => {
    myMap.value = null;
  });
</script>

<style>
.marker-cluster div {
  width: 30px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;
  color: white;
  text-align: center;
  border-radius: 15px;
  border-width: 10px;
  font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
  background-color: #1997c6;
}

.marker-cluster {
  background-color: white;
}

.marker-cluster-selected {
  background-color: yellow;
}

.marker-cluster-failing div {
  background-color: #cd201f;
}
</style>
