<template>
    <div style="height: 100%">
        <client-only>
            <l-map ref="myMap"
               :center="center" :zoom="zoom" :options="mapOptions" v-if="isMounted"
        >
            <l-tile-layer
                    :url="url"
                    :attribution="attribution"
            />
            <v-marker-cluster :options="clusterOptions" ref="clusterRef">
                <l-circle-marker v-for="marker in markers" :lat-lng="marker.latLng" @click="nodeSelected(marker.node)"
                                 :key="marker.node.publicKey"
                                 :fillColor="marker.color" :fillOpacity="1" :color="getColor(marker)" :radius="7"
                                 :options="{publicKey: marker.node.publicKey, isNodeFailing: isNodeFailing(marker.node), organizationId: marker.node.organizationId}">
                    <slot>lol</slot>
                    <l-tooltip :options="{ permanent: false, interactive: true }">
                        <div :id="marker.node.publicKey">
                            <full-validator-title :node="marker.node"/>
                        </div>
                    </l-tooltip>
                </l-circle-marker>
            </v-marker-cluster>
        </l-map>
        </client-only>
    </div>
</template>

<script lang="ts">

    import 'leaflet/dist/leaflet.css';
    import "leaflet.markercluster/dist/MarkerCluster.css";
    import "leaflet.markercluster/dist/MarkerCluster.Default.css";

    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Vue from 'vue';
    import {Node} from '@stellarbeat/js-stellar-domain';
    import FullValidatorTitle from '@/components/node/full-validator-title.vue';
    import Store from '@/store/Store';

    //ssr voodoo because leaflet uses window global only available in browser
    let divIcon: any, latLng:any, icon:any, circleMarker:any, lBrowser:any, point:any;
    let LCircleMarker: any, LMap:any, LMarker:any, LTileLayer: any, LTooltip: any;
    let Vue2LeafletMarkerCluster: any;
    let Vue2Leaflet:any;
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
        const leaflet = require('leaflet');
        icon = leaflet.Icon;
        point = leaflet.point;
        divIcon = leaflet.divIcon;
        circleMarker = leaflet.circleMarker;
        lBrowser = leaflet.Browser;
        delete icon.Default.prototype._getIconUrl;
        icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png')
        })
        latLng = require('leaflet').latLng;
        require('leaflet-sleep');
        Vue2Leaflet = require('vue2-leaflet');
        LCircleMarker = Vue2Leaflet.LCircleMarker;
        LMap = Vue2Leaflet.LMap;
        LMarker = Vue2Leaflet.LMarker;
        LTileLayer = Vue2Leaflet.LTileLayer;
        LTooltip = Vue2Leaflet.LTooltip;
        Vue2LeafletMarkerCluster = require('vue2-leaflet-markercluster');
    }
    type Marker = {
        latLng: any,
        node: Node,
        color: string
    }

    import ClientOnly from "vue-client-only";

    @Component({
        name: 'world-map',
        components: {
            FullValidatorTitle,
            LMap,
            LTileLayer,
            LCircleMarker,
            LMarker,
            LTooltip,
            'v-marker-cluster': Vue2LeafletMarkerCluster,
            ClientOnly
        }
    })

    export default class WorldMap extends Vue {
        protected url: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        protected attribution: string = '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
        protected zoom: number = 2;
        protected isMounted:boolean = false;

        @Prop({default: false})
        fullScreen!:boolean;

        mounted(){
            this.isMounted = true;
        }
        get store(): Store {
            return this.$root.$data.store;
        }

        @Watch('fullScreen')
        public fullScreenChanged(){
            (this.$refs.myMap as any).mapObject.invalidateSize();
            if(this.fullScreen)
                this.zoom= 3;
            else
                this.zoom = 2;
        }

        @Watch('selectedNode')
        public onSelectedNodeChanged() { //not on initial load
            this.$nextTick(() => {
                (this.$refs.clusterRef as any).mapObject.refreshClusters();
            });
        }

        @Watch('selectedOrganization')
        public onSelectedOrganizationChanged() { //not on initial load
            this.$nextTick(() => {
                (this.$refs.clusterRef as any).mapObject.refreshClusters();
            });
        }


        get selectedNode() {
            return this.store.selectedNode;
        }

        get selectedOrganization() {
            return this.store.selectedOrganization;
        }

        get centerNode() {
            return this.store.centerNode;
        }

        get network() {
            return this.store.network;
        }

        isNodeFailing(node: Node) {
            return this.network.isNodeFailing(node);
        }

        get markers(): Marker[] {
            return this.store.network.nodes
                .filter(this.store.watcherNodeFilter)
                .filter(node => node.geoData.latitude)
                .map(geoNode => {
                    return {
                        'latLng': latLng(geoNode.geoData.latitude!, geoNode.geoData.longitude!),
                        'node': geoNode,
                        'color': !this.network.isNodeFailing(geoNode) ? '#1997c6' : '#cd201f'
                    };
                });
        }

        get center(): any {
            if (this.selectedNode && this.selectedNode.geoData.longitude && this.selectedNode.geoData.latitude) {
                return latLng(this.selectedNode.geoData.latitude, this.selectedNode.geoData.longitude);
            } else
                return latLng(25.505, -0.09);
        }

        getColor(marker: Marker) {
            if (this.selectedNode && this.selectedNode === marker.node)
                return 'yellow';

            if (this.selectedOrganization && this.selectedOrganization.validators.includes(marker.node.publicKey!))
                return 'yellow';

            return 'white';
        }

        public nodeSelected(node: Node) {
            if (this.$route.params.publicKey && this.$route.params.publicKey === node.publicKey)
                return;

            this.$router.push(
                {
                    name: 'node-dashboard',
                    params: {publicKey: node.publicKey!},
                    query: {'center': '1', 'no-scroll': '1', 'view': this.$route.query.view, 'network': this.$route.query.network, 'at': this.$route.query.at},
                },
            );
        }

        get clusterOptions(): any {
            return {
                maxClusterRadius: 30,
                iconCreateFunction: (cluster: any) => {
                    let markers: any[] = cluster.getAllChildMarkers();
                    return divIcon({
                        html: '<div><span>' + markers.length + '</span></div>',
                        className: this.getMarkerClusterClasses(markers),
                        iconSize: point(40, 40),
                    });
                }
            };
        }

        getMarkerClusterClasses(markers: any[]) {
            let classes: string[] = ['marker-cluster'];
            if (markers.filter((marker: any) => !marker.options.isNodeFailing).length === 0)
                classes.push('marker-cluster-failing');

            let isSelected = false;

            if (this.selectedNode)
                isSelected = markers.some((marker: any) => marker.options.publicKey === this.selectedNode!.publicKey);

            if (this.selectedOrganization)
                isSelected = markers.some((marker: any) => marker.options.organizationId === this.selectedOrganization!.id);

            if (isSelected)
                classes.push('marker-cluster-selected');

            return classes.join(' ');
        }


        get mapOptions(): any {
            return {
                wakeTime: 250,
                sleepTime: 250,
                sleepNote: false,
                wakeMessage: false,
                sleepOpacity: 1,
                noBlockingAnimations: true
            };
        }

        beforeDestroy() {
            (this.$refs.myMap as any) = {};
        }
    }
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