<template>

    <div class="card" :class="dimmerClass">
        <div class="loader"></div>
        <div class="card-body p-0 d-flex flex-column justify-content-between dimmer-content">
            <div class="d-flex justify-content-between align-items-start pt-3 px-3">
                <div class="">
                    <div class="text-muted">
                        {{title}}
                    </div>
                    <div v-if="!(isSimulationSensitive && store.isSimulation)">
                        <div v-if="hasActiveElement" class="d-flex">
                            <div class="active-element-value mr-1">
                                {{isBool ? activeElement[statsProperty] * 100 + '%' : activeElement[statsProperty]}}
                            </div>
                            <div class="active-element-time align-self-start text-muted">
                                {{formatTime(activeElement.time)}}
                            </div>
                        </div>
                        <div v-else>
                            <div v-if="value !== undefined">
                                <div v-if="isBool" class="value" style="color: #5eba00">
                                    <b-badge :variant="value ? 'success' : 'danger'">{{value ? 'Yes' : 'No'}}</b-badge>
                                </div>
                                <div v-else class="value">
                                    {{value}}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="value">
                        <b-badge variant="info">Simulation</b-badge>
                    </div>
                </div>
                <b-button size="sm" @click="showModal=true" style="border: none; box-shadow: none">
                    <b-icon-info-circle v-b-tooltip:hover.top="'Click for info'" class="text-muted"/>
                </b-button>
            </div>
            <div style="height: 35px">
                <network-statistics-chart v-if="initialDataLoaded" :stats-property="statsProperty"
                                          :year-statistics="yearStatistics" v-on:hover="onHover"/>
            </div>
        </div>
        <b-modal lazy title="Info" ok-only hide-header v-model="showModal">
            <slot name="info"></slot>
        </b-modal>
    </div>
</template>

<script lang="ts">
    import moment from 'moment';
    import {Component, Mixins, Prop} from 'vue-property-decorator';
    import {BTooltip, BIconInfoCircle, VBTooltip, BButton, BModal, BBadge} from 'bootstrap-vue';
    import NetworkStatisticsChart from '@/components/network/cards/network-statistics/network-statistics-chart.vue';
    import NetworkStatisticsAggregation from '@stellarbeat/js-stellar-domain/lib/network-statistics-aggregation';
    import {StoreMixin} from '@/mixins/StoreMixin';

    @Component({
        components: {NetworkStatisticsChart, BTooltip, BIconInfoCircle, BButton, BModal, BBadge},
        directives: {'b-tooltip': VBTooltip}
    })
    export default class NetworkStatisticsCard extends Mixins(StoreMixin) {
        @Prop({default: true})
        isLoading!: boolean;
        @Prop()
        tooltip!: string;
        @Prop()
        title!: string;
        @Prop()
        value!: number;
        @Prop()
        initialDataLoaded!: boolean;
        @Prop()
        yearStatistics!: NetworkStatisticsAggregation[];
        @Prop()
        statsProperty!: string;
        @Prop({default: false})
        isBool!: boolean;
        @Prop({default: false})
        isSimulationSensitive!: boolean;

        activeElement: NetworkStatisticsAggregation | null = null;
        showModal: boolean = false;

        get hasActiveElement() {
            return this.activeElement !== null;
        }

        onHover(stat: NetworkStatisticsAggregation) {
            this.activeElement = stat;
        }

        formatTime(date: Date) {
            return moment(date).format('MMM YYYY');
        }

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

    .value {
        font-size: 18px;
        font-weight: bold;
        line-height: 20px;
        padding-bottom: 0px;
    }

    .active-element-time {
        font-size: 12px;
        line-height: 17px;
        align-self: flex-start;
    }

    .active-element-value {
        font-size: 18px;
        font-weight: bold;
        line-height: 20px;
        padding-bottom: 0px;
    }
</style>