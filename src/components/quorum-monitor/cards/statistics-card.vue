<template>
    <div class="card">
        <div class="card-header">
            <h5 class="card-title">
                <h5 class="card-title">Validating history: {{this.selectedNode.displayName | truncate(25)}}</h5>
            </h5>
        </div>
        <div class="card-body">
            <div v-bind:class="dimmerClass">
                <div class="loader"></div>
                <div class="dimmer-content" ref="chartContainer">
                    <uptime-chart v-if="renderChart" :stats="this.statistics" :chartWidth="chartWidth"></uptime-chart>
                    <div class="date-selector d-flex">
                        <b-button :disabled="!canGoBack()" size="sm" v-on:click="goBack30Days()"><i class="fe fe-chevron-left"></i></b-button>
                        <datepicker v-model="datePickerDate" :disabledDates="disabledDates" :bootstrap-styling="true"></datepicker>
                        <b-button size="sm" v-on:click="goForward30Days()"><i class="fe fe-chevron-right"></i></b-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Watch} from "vue-property-decorator";
    import UptimeChart from "@/components/quorum-monitor/statistics/uptime-chart.vue";
    import FullValidatorTitle from "@/components/node/full-validator-title.vue";
    import Store, {ValidatingStatistic} from "@/Store";
    import Datepicker from "vuejs-datepicker";

    @Component({
        name: "statistics-card",
        components: {FullValidatorTitle, UptimeChart, datepicker: Datepicker}
    })
    export default class StatisticsCard extends Vue {
        statistics: ValidatingStatistic[] = [];
        isLoading: boolean = true;
        selectedDate: Date = new Date();
        datePickerDate: string|null = null;
        minSelectedDate: Date = new Date('2019-06-18');
        disabledDates:any = {
            to: this.minSelectedDate,
            from: new Date()
        };
        renderChart:boolean = false;

        @Watch("selectedNode")
        public onSelectedNodeChanged() {
            this.updateStatistics();
        }

        @Watch("datePickerDate")
        public onDatePickerDateChanged(){
            if(this.datePickerDate) {
                this.selectedDate = new Date(this.datePickerDate);
                this.updateStatistics();
            }
        }

        get chartWidth() {
            return (this.$refs.chartContainer as HTMLDivElement).clientWidth;
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.quorumMonitorStore.selectedNode;
        }

        get dimmerClass() {
            return {
                dimmer: true,
                active: this.isLoading,
            };
        }

        onDateSelected(date: Date) {
            this.selectedDate = date;
            this.updateStatistics();
        }

        canGoBack() {
            return this.selectedDate > this.minSelectedDate;
        }
        goBack30Days() {
            this.selectedDate.setDate(this.selectedDate.getDate() - 30);
            if(this.selectedDate < this.minSelectedDate) {
                this.selectedDate.setTime(this.minSelectedDate.getTime());
            }
            this.datePickerDate = this.selectedDate.toDateString();
            this.updateStatistics();
        }

        goForward30Days() {
            this.selectedDate.setDate(this.selectedDate.getDate() + 30);
            this.datePickerDate = this.selectedDate.toDateString();
            this.updateStatistics();
        }

        async updateStatistics() {
            if (this.selectedNode) {
                this.isLoading = true;
                let thirtyDaysAgo = new Date(this.selectedDate.getTime());
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);
                this.statistics = await this.store.fetchValidatingStatistics(this.selectedNode.publicKey, thirtyDaysAgo, this.selectedDate);
                this.isLoading = false;
            }
        }

        async mounted() {
            this.selectedDate.setDate(this.selectedDate.getDate() - 1);
            this.datePickerDate = this.selectedDate.toDateString();
            await this.updateStatistics();
            this.renderChart = true;
        }
    }
</script>
<style scoped>
    .measure-point-green {
        fill: #5eba00;
    }

    .measure-point-warning {
        fill: #f1c40f;
    }

    .measure-point-danger {
        fill: #e9ecef;
    }

    .measure-point:hover {
        fill: darkgreen;
    }

    .total-percentage {
        color: #aaaaaa;
        font-size: small;
    }

    .spacer {
        flex: 1;
        margin: 0.65rem 1rem 0 0.5rem;
        height: 1px;
        background: #aaa;
        opacity: 0.3
    }
    .date-picker{
        color: white;
    }

    .date-picker-input{
        color:white;
        background-color: white !important;
    }

    .dimmer.active .dimmer-content {
        opacity: 0.4;
    }
</style>