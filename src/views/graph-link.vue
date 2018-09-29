<template>
    <path
            v-bind:class="classObject"
            v-bind:d="path"
    />
</template>

<script>
    export default {
        name: "graph-link",
        props: {
            link: {
                type: Object
            },
            selectedNode: {
                type: Object
            }
        },
        computed: {
            path: function () {
                return 'M' + this.link.source.x + ' ' + this.link.source.y + ' L' + (this.link.target.x) + ' ' + (this.link.target.y)
            },
            classObject: function () {
                return {
                    'from-selected': this.link.source === this.selectedNode,
                    'to-selected': this.link.target === this.selectedNode,
                    'cluster': this.link.isClusterLink/*,
                    'inactive': !this.link.originLink.active*/
                }
            }
        }
    }
</script>

<style scoped>
    path {
        stroke: #74e1ff;
        stroke-width: 0.5px;
        stroke-opacity: 0.14;
    }

    path.inactive{
        stroke: #ECEBE4;
        stroke-opacity: 0.6;
    }

    path.cluster {
        stroke-width: 0.8px;
        stroke-opacity: 0.7;
    }
    path.from-selected {
        stroke: #e4d836;
        stroke-opacity: 0.5;
        stroke-width: 1px;
    }

    path.to-selected {
        stroke: #1bc98e;
        stroke-opacity: 0.5;
        stroke-width: 1px;
    }
</style>