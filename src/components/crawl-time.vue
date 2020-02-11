<template>
    <div class="d-flex crawl-time-component mt-1">
        <datepicker id="datePickerCrawlTime" input-class="date-picker-input-white date-picker-input-white-no-border" :wrapper-class="'date-picker-wrapper'" v-model="crawlDate" :disabledDates="disabledDates"
                    :bootstrap-styling="true"/>
        <vue-timepicker hide-clear-button input-width="7em" class="" v-model="crawlTime" input-class="timepicker-no-border-right" format="HH:mm:ss"/>
        <button v-b-tooltip.hover title="Travel to selected time (beta)" class="btn btn-sm btn-secondary time-travel-btn" @click="timeTravel">
            <i class="fe fe-clock"></i> Travel
        </button>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import Datepicker from 'vuejs-datepicker';
    import moment from 'moment';
    import 'vue2-timepicker/dist/VueTimepicker.css';
    import VueTimePicker from 'vue2-timepicker';

    @Component({
        name: 'crawl-time',
        components: {
            Datepicker,
            'vue-timepicker': VueTimePicker
        }
    })
    export default class CrawlTime extends Vue {
        protected crawlDate:Date;
        protected crawlTime:{ HH: string, mm: string, ss:string };
        protected minSelectedDate: Date = this.store.measurementsStartDate;

        protected disabledDates: any = {
            to: this.minSelectedDate,
            from: new Date()
        };

        constructor() {
            super();
            this.crawlDate = new Date(this.store.network.crawlDate.getTime());
            this.crawlTime = {
                HH: moment(this.crawlDate).format('HH'),
                mm: moment(this.crawlDate).format('mm'),
                ss: moment(this.crawlDate).format('ss')
            };
        }
        get store(): Store {
            return this.$root.$data.store;
        }

        public async timeTravel() {
            console.log(this.crawlTime);
            console.log(moment(this.crawlDate).hours(Number(this.crawlTime.HH)).minutes(Number(this.crawlTime.mm)).toDate());
            this.store.isLoading = true;
            await this.store.fetchData(
                moment(this.crawlDate).hours(Number(this.crawlTime.HH)).minutes(Number(this.crawlTime.mm)).seconds(Number(this.crawlTime.ss)).toDate()
            );
            this.store.isLoading = false;
        }

    }
</script>

<style scoped>
    .crawl-time-component {
    }
    .time-travel-btn {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: none;
    }
    #datePickerCrawlTime {
        background-color: white;
    }
</style>
<style>

</style>