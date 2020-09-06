<template>
    <div class="d-flex">
        <b-button-group size="sm">
            <b-button size="sm" :disabled="!canGoBack()" class="left" v-on:click="goBack">
                <b-icon-chevron-left/>
            </b-button>
            <div>
                <b-form-datepicker size="sm"  v-if="!showTime" :dark="true" v-model="datePickerDate" class="date-picker p-0"
                              :date-format-options="{ year: 'numeric', month: 'short', day: '2-digit'}"
                              :min="statisticsDateTimeNavigator.getMinSelectedDate(this.bucketSize)" :max="new Date()">
                    <template v-slot:button-content><b-icon-calendar class="text-gray"/></template>
                </b-form-datepicker>
                <b-form-timepicker size="sm" v-else v-model="time" class="time-picker p-0"
                              @hidden="timeInputHandler" :key="time">
                    <template v-slot:button-content></template>
                </b-form-timepicker>
            </div>
            <b-button size="sm" @click="timeTravel" variant="secondary" class="time-travel-btn" v-b-tooltip.hover
                      title="Travel to selected time">
                <b-icon-clock/>
            </b-button>
            <b-button size="sm" v-on:click="goForward" class="right">
                <b-icon-chevron-right/>
            </b-button>
        </b-button-group>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import moment from 'moment';
    import {
        BButton,
        BIconChevronRight,
        BIconChevronLeft,
        BIconClock,
        BFormDatepicker,
        BFormTimepicker,
        VBTooltip,
        BIconCalendar,
        BButtonGroup
    } from 'bootstrap-vue';
    import StatisticsDateTimeNavigator
        from '@/components/network/cards/network-analysis-charts/StatisticsDateTimeNavigator';

    @Component({
        name: 'date-navigator',
        components: {
            BButton,
            BIconChevronRight,
            BIconClock,
            BFormDatepicker,
            BFormTimepicker,
            BIconChevronLeft,
            BIconCalendar,
            BButtonGroup
        },
        directives: {'b-tooltip': VBTooltip}
    })
    export default class DateNavigator extends Vue {
        @Prop()
        selectedDate!: Date;
        @Prop()
        bucketSize!: string;
        @Prop({default: false})
        showTime!: boolean;

        protected statisticsDateTimeNavigator!: StatisticsDateTimeNavigator;

        datePickerDate: Date = this.selectedDate;
        time: string = moment(this.selectedDate).format('HH:mm');

        canGoBack() {
            return this.statisticsDateTimeNavigator.canGoBack(this.bucketSize, this.datePickerDate);
        }

        goBack() {
            this.$nextTick(() => {
                this.datePickerDate = this.statisticsDateTimeNavigator.goBack(this.bucketSize, this.datePickerDate);
                this.time = moment(this.datePickerDate).format('HH:mm');
                this.$emit('dateChanged', this.datePickerDate);
            });
        }

        goForward() {
            this.$nextTick(() => {
                this.datePickerDate = this.statisticsDateTimeNavigator.goForward(this.bucketSize, this.datePickerDate);
                this.time = moment(this.datePickerDate).format('HH:mm');
                this.$emit('dateChanged', this.datePickerDate);
            });

        }

        @Watch('selectedDate', {})
        async onSelectedDateChanged(to: string, from: string) {
            this.datePickerDate = this.selectedDate;
            this.time = moment(this.selectedDate).format('HH:mm');
        }

        @Watch('datePickerDate', {})
        async onDatePickerDateChanged(to: string, from: string) {
            if (this.datePickerDate && from !== null && this.selectedDate !== this.datePickerDate) {
                this.time = moment(this.datePickerDate).format('HH:mm');
                this.$emit('dateChanged', this.datePickerDate);
            }
        }

        timeInputHandler() {
            if (this.time !== moment(this.datePickerDate).startOf('minutes').format('HH:mm:ss')) {
                this.datePickerDate = moment(this.datePickerDate).hours(Number(this.time.substr(0, 2))).minutes(Number(this.time.substr(3, 2))).toDate();
                this.time = moment(this.datePickerDate).format('HH:mm');
                this.$emit('dateChanged', this.datePickerDate);
            }
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        async timeTravel() {
            this.store.isLoading = true;
            await this.store.fetchData(this.datePickerDate);
            this.store.isLoading = false;
        }

        public async created() {
            this.statisticsDateTimeNavigator = new StatisticsDateTimeNavigator(this.store.measurementsStartDate);
        }
    }
</script>

<style scoped>
    .time-travel-btn {
        color: #1997c6;
        border-radius: 0;
    }

    .time-picker {
        border-radius: 0;
        border-left: 0;
        width: 100px;
        animation: highlight 1s;
    }

    .date-picker {
        border-radius: 0;
        border-left: 0;
    }
</style>