<template>

    <div class="card">
        <div class="card-body p-3 d-flex flex-column justify-content-between">
            <div class="d-flex justify-content-between mb-2">
                <div class="text-muted">
                    {{title}}
                        <b-icon-info-circle v-b-tooltip:hover.top="tooltip"/>
                </div>
                <div class="d-flex">
                    <div class="h3 mb-0 mr-0">
                        {{value}}
                    </div>

                </div>

            </div>
            <div :class="dimmerClass">
                <div class="loader"></div>
                <div style="height: 40px" class="dimmer-content">
                    <slot></slot>
                </div>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import {BTooltip, BIconInfoCircle, VBTooltip} from 'bootstrap-vue';
    import NetworkStatisticsChart from '@/components/network/cards/network-statistics/network-statistics-chart.vue';

    @Component({
        components: {NetworkStatisticsChart, BTooltip, BIconInfoCircle},
        directives: {'b-tooltip': VBTooltip}
    })
    export default class NetworkStatisticsCard extends Vue {
        @Prop({default: true})
        isLoading!:boolean
        @Prop()
        tooltip!:string;
        @Prop()
        title!:string;
        @Prop()
        value!:number;

        get dimmerClass() {
            return {
                dimmer: true,
                active: this.isLoading,
            };
        }
    }
</script>

<style scoped>
    .info {
        float: right;
        padding-bottom: 1px;
        opacity: 0.5;
    }
</style>