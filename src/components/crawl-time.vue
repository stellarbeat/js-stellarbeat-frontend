<template>
    <div class="crawl-time-component">
        <b-form-datepicker v-model="crawlDate" class="date-picker"
                      :date-format-options="{ year: 'numeric', month: 'short', day: '2-digit'}"
                      :min="minSelectedDate" :max="new Date()">
            <template v-slot:button-content><b-icon-calendar class="text-gray"/></template>
        </b-form-datepicker>
        <b-form-timepicker v-model="crawlTime" class="time-picker" dropleft>
            <template v-slot:button-content></template>
        </b-form-timepicker>
        <button v-b-tooltip.hover title="Travel to selected time" class="btn btn-sm btn-primary time-travel-btn" @click="timeTravel">
            <b-icon-clock/>
        </button>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import moment from 'moment';
    import {BIconClock, BIconCalendar, BFormTimepicker, BFormDatepicker, VBTooltip} from 'bootstrap-vue';

    @Component({
        name: 'crawl-time',
        components: {BIconClock, BIconCalendar, BFormTimepicker, BFormDatepicker},
        directives: {'b-tooltip': VBTooltip}
    })
    export default class CrawlTime extends Vue {
        protected crawlDate:Date = new Date(this.store.network.crawlDate.getTime());
        protected crawlTime:string = moment(this.crawlDate).format('HH:mm:ss');
        protected minSelectedDate: Date = this.store.measurementsStartDate;

        get store(): Store {
            return this.$root.$data.store;
        }

        public async timeTravel() {
            this.store.isLoading = true;
            await this.store.fetchData(
                moment(this.crawlDate).hours(Number(this.crawlTime.substr(0, 2))).minutes(Number(this.crawlTime.substr(3, 2))).toDate()
            );
            this.store.isLoading = false;
        }

    }
</script>

<style scoped>
    .date-picker {
        width: auto;
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
        border-right:0;
    }
    .crawl-time-component {
        display: flex;
    }
    .time-travel-btn {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
    .time-picker {
        width: 125px;
        border-radius: 0;
    }
</style>
<style>

</style>