<template>
    <div class="card ">
        <div class="card-body p-3">
            <div ref="map" id="map"></div>
        </div>
        <div class="card-footer">
            Geolocation data was retrieved using the <a href="https://ipstack.com/">ipstack API</a>
        </div>
    </div>
</template>

<script>
    //    require('leaflet');
    require('leaflet.markercluster');
    require('leaflet-sleep');

    import 'leaflet/dist/leaflet.css';
    import 'leaflet.markercluster/dist/MarkerCluster.css';
    import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

    import L from 'leaflet';

    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png')
    });

    export default {
        name: "nodes-map",
        data() {
            return {
                map: {}
            }
        },
        props: {
            network: {
                type: Object
            }
        },
        /*watch: {
            network: function (network) {
                this.initializeMap();
            }
        },*/
        methods: {
            //todo: refactor to vue.js way
            initializeMap: function () {
                this.map = L.map(this.$refs.map,{
                    wakeTime: 250,
                    sleepTime: 250,
                    sleepNote: false,
                    wakeMessage: false,
                    sleepOpacity: 1
                }).setView([51.505, -0.09], 1.5);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);
                L.Icon.Default.imagePath = './assets/vendor/leaflet';

                this.addMarkers(this.network.nodes.filter(node => node.active), this.map);
            },
            addMarkers: function (nodes, map) {
                let markers = new Map();
                let clusterMarkers = L.markerClusterGroup({"maxClusterRadius": 30});
                let coverages = new L.LayerGroup();

                let nodeConnections = new Map();
                let clickedNodes = new Set();
                let coordinateMap = new Map();
                nodes.forEach(function (node) {
                    //build coordinate map for clustering
                    if (node.geoData.latitude === undefined || node.geoData.longitude === undefined) {
                        //console.log(node);
                    } else {
                        if (!coordinateMap.get(node.geoData.latitude + ':' + node.geoData.longitude)) {
                            coordinateMap.set(node.geoData.latitude + ':' + node.geoData.longitude, [])
                        }
                        coordinateMap.get(node.geoData.latitude + ':' + node.geoData.longitude).push(node);
                    }
                });

                for (let map of coordinateMap.entries()) {

                    let overlappingNodesCount = map[1].length;
                    let xGridMax = Math.ceil(Math.sqrt(overlappingNodesCount));
                    let x = 0;
                    let y = 0;
                    let spacing = 0.1;
                    map[1].forEach(node => {
                        let lat = parseFloat(node.geoData.latitude);
                        let long = parseFloat(node.geoData.longitude);
                        if (x === xGridMax) {
                            x = 0;
                            y++;
                        }
                        let marker = this.getMarker(
                            [lat + spacing * x, long + spacing * y],
                            node.displayName
                        );
                        x++;

                        clusterMarkers.addLayer(marker);

                        //marker.addTo(map);
                        markers.set(node.publicKey, marker);
                        this.addNodePopup(node, marker);


                    });


                }

                map.addLayer(clusterMarkers);

                return markers;
            },
            addNodePopup: function (node, marker) {
                let info = '';

                let rating = 'Availability: ';

                let counter = 0;

                if (node.statistics.activeRating >= 4) {
                    rating += '<span class="badge badge-success" style="font-size: 0.8rem;">' + node.statistics.activeRating * 20 + '%</span>';
                } else if (node.statistics.activeRating >= 2) {
                    rating += '<span class="badge badge-warning" style="font-size: 0.8rem;">' + node.statistics.activeRating * 20 + '%</span>';
                } else {
                    rating += '<span class="badge badge-danger" style="font-size: 0.8rem;">' + node.statistics.activeRating * 20 + '%</span>';
                }

                info += rating;

                // Some (verified) nodes have a name
                if (node.name) info += '<br>Name: ' + node.name;

                // If we have location information (most of the time), display it
                if (node.country) info += '<br>Location: ';
                if (node.city) info += node.city + ', ';
                if (node.country) info += node.country;

                // Show IP
                info += '<br>IP: ' + node.ip;

                // Link to node details page
                info += '<br><br><a href="/nodes/' + node.publicKey + '">View node details</a>';

                // Place the marker
                return marker.bindPopup(info);
            },
            getMarker: function (coordinates, title) {
                return L.marker(
                    coordinates,
                    {
                        "title": title,
                        "riseOnHover": true
                    }
                );
            }

        },
        mounted() {
            this.initializeMap();
        },
        beforeDestroy: function () {
            this.map.remove();
            this.map = {};
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
        font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
    }

    .marker-cluster-small {
        background-color: #2880ca80 !important;
    }

    .marker-cluster-small div {
        background-color: #1997c6 !important;
    }

    .marker-cluster-medium {
        background-color: #2880ca80 !important;
    }

    .marker-cluster-medium div {
        background-color: #1997c6 !important;
    }

    .marker-cluster-large {
        background-color: #2880ca80 !important;
    }

    .marker-cluster-large div {
        background-color: #1997c6 !important;
    }

    #map {
        height: 420px;
    }
</style>