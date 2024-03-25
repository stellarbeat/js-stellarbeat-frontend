<template>
  <div style="height: 100%" ref="mapRef">
    <!-- The map will be created programmatically in the script section -->
  </div>
</template>

<script setup lang="ts">
import * as L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Node } from "@stellarbeat/js-stellarbeat-shared";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

interface CustomMarkerOptions extends L.CircleMarkerOptions {
  publicKey: string | null;
  organizationId: string | null;
}

const icon = L.Icon;
const point = L.point;
const divIcon = L.divIcon;

icon.Default.mergeOptions({
  iconRetinaUrl: "leaflet/dist/images/marker-icon-2x.png",
  iconUrl: "leaflet/dist/images/marker-icon.png",
  shadowUrl: "leaflet/dist/images/marker-shadow.png",
});

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
const store = useStore();
const mapRef = ref();
const map = ref<L.Map | null>(null);
const clusterGroup = ref<L.MarkerClusterGroup | null>(null);
const fullScreen = ref(props.fullScreen);

watch(fullScreen, () => {
  if (!map.value) {
    return;
  }
  map.value?.invalidateSize();
  if (fullScreen.value) zoom.value = 3;
  else zoom.value = 2;
});

const selectedNode = computed(() => {
  return store.selectedNode;
});

const selectedOrganization = computed(() => {
  return store.selectedOrganization;
});

function updateCenter() {
  if (selectedNode.value) {
    map.value?.setView(
      [
        selectedNode.value?.geoData.latitude ?? 0,
        selectedNode.value?.geoData.longitude ?? 0,
      ],
      zoom.value,
    );
  }
}

function refreshClusters() {
  const clusterGroupValue = clusterGroup.value;
  if (clusterGroupValue !== null) {
    updateMarkers();
    updateCenter();
  }
}

watch(
  selectedNode,
  () => {
    refreshClusters();
  },
  { immediate: false },
);

watch(
  selectedOrganization,
  () => {
    //not on initial load
    refreshClusters();
  },
  { immediate: false },
);

const network = store.network;
const route = useRoute();
const router = useRouter();
const markersData = computed(() =>
  store.network.nodes.filter(store.watcherNodeFilter),
);

const center = computed(() => {
  if (
    selectedNode.value &&
    selectedNode.value?.geoData.longitude &&
    selectedNode.value?.geoData.latitude
  ) {
    return L.latLng(
      selectedNode.value?.geoData.latitude ?? 0,
      selectedNode.value?.geoData.longitude ?? 0,
    );
  } else return L.latLng(25.505, -0.09);
});

function getColor(node?: Node) {
  if (node && selectedNode.value === node) return "yellow";

  if (node && selectedOrganization.value?.validators.includes(node.publicKey))
    return "yellow";

  return "white";
}

function nodeSelectedToRouter(node: Node) {
  if (route.params.publicKey && route.params.publicKey === node.publicKey)
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

function getMarkerClusterClasses(markersOptions: CustomMarkerOptions[]) {
  const classes: string[] = ["marker-cluster"];
  if (
    markersOptions.filter(
      (options) =>
        options.publicKey &&
        !network.isNodeFailing(network.getNodeByPublicKey(options.publicKey)),
    ).length === 0
  )
    classes.push("marker-cluster-failing");

  let isSelected = false;

  if (selectedNode.value)
    isSelected = markersOptions.some(
      (options) => options?.publicKey === selectedNode.value?.publicKey,
    );

  if (selectedOrganization.value)
    isSelected = markersOptions.some(
      (option) => option?.organizationId === selectedOrganization.value?.id,
    );

  if (isSelected) classes.push("marker-cluster-selected");

  return classes.join(" ");
}

onMounted(() => {
  map.value = L.map(mapRef.value as string, {}).setView(
    [center.value.lat, center.value.lng],
    zoom.value,
  );
  L.tileLayer(url, { attribution }).addTo(map.value as L.Map);
  clusterGroup.value = L.markerClusterGroup({
    maxClusterRadius: 30,
    iconCreateFunction: (cluster: L.MarkerCluster) => {
      const markers: L.Marker[] = cluster.getAllChildMarkers();
      return divIcon({
        html: "<div><span>" + markers.length + "</span></div>",
        className: getMarkerClusterClasses(
          markers.map((marker) => marker.options as CustomMarkerOptions),
        ),
        iconSize: point(40, 40),
      });
    },
  });
  map.value?.addLayer(clusterGroup.value as L.MarkerClusterGroup);
  updateMarkers();
});

watch(
  markersData,
  () => {
    updateMarkers();
  },
  { deep: true },
);

function updateMarkers() {
  console.log("updateMarkers");
  const myClusterGroup = clusterGroup.value;
  if (myClusterGroup !== null) {
    console.log("clearing layers");
    myClusterGroup.clearLayers(); // Clear existing markers

    markersData.value.forEach((node) => {
      const customMarkerOptions: CustomMarkerOptions = {
        color: getColor(node),
        fillColor: !network.isNodeFailing(node) ? "#1997c6" : "#cd201f",
        fillOpacity: 1,
        radius: 7,
        publicKey: node.publicKey,
        organizationId: node.organizationId,
      };
      const marker = L.circleMarker(
        [node.geoData.latitude ?? 0, node.geoData.longitude ?? 0],
        customMarkerOptions,
      );
      marker.on("click", () => {
        nodeSelectedToRouter(node);
      });
      marker.bindTooltip(node.displayName, {
        permanent: false,
        direction: "top",
      });

      myClusterGroup.addLayer(marker);
    });
  }
}

onBeforeUnmount(() => {
  if (map.value) {
    map.value?.remove();
    map.value = null;
  }
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
  font:
    12px "Helvetica Neue",
    Arial,
    Helvetica,
    sans-serif;
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
