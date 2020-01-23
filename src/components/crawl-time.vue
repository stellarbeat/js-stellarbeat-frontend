<template>
    <div class="d-flex">
        <div class="page-subtitle ml-4 mr-2">{{crawlDate.toLocaleString()}}</div>
        <button class="btn btn-sm btn-secondary" v-b-modal.modal-time-travel>
            <i class="fe fe-clock"></i>
        </button>
        <b-modal v-on:ok="timeTravel" id="modal-time-travel" title="Time Travel (Beta)">
            <b-form @submit="timeTravel">
                <b-form-group
                        id="input-group-1"
                        label="Select date:"
                        label-for="datePicker"
                >
                    <datepicker id="datePicker" class="mb-2" v-model="crawlDate" :disabledDates="disabledDates"
                                :bootstrap-styling="true"/>
                </b-form-group>
                <b-form-group
                        id="input-group-2"
                        label="Select time:"
                        label-for="timeInput"
                >
                    <b-form-input id="timeInput" type="time" v-model="crawlTime"/>
                </b-form-group>
            </b-form>
        </b-modal>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import Store from '@/Store';
    import Datepicker from 'vuejs-datepicker';
    import moment from 'moment';

    @Component({
        name: 'crawl-time',
        components: {
            Datepicker
        }
    })
    export default class CrawlTime extends Vue {
        protected crawlDate:Date;
        protected crawlTime:string;
        protected minSelectedDate: Date = this.store.measurementsStartDate;
        protected disabledDates: any = {
            to: this.minSelectedDate,
            from: new Date()
        };

        constructor() {
            super();
            this.crawlDate = new Date(this.store.crawlDate.getTime());
            this.crawlTime = this.crawlDate.getHours() + ':' + this.crawlDate.getMinutes();
            console.log(this.crawlTime);
        }
        get store(): Store {
            return this.$root.$data.store;
        }

        public async timeTravel() {
            let isTimeValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(this.crawlTime);
            let hours = 0;
            let minutes = 0;
            if (isTimeValid) {
                let parsedTime = this.crawlTime.split(':');
                hours = Number(parsedTime[0]);
                minutes = Number(parsedTime[1]);
            }

            this.store.isLoading = true;
            this.crawlDate.setHours(hours);
            this.crawlDate.setMinutes(minutes);
            await this.store.timeTravelTo(this.crawlDate);
            this.store.isLoading = false;
        }
    }
</script>

<style scoped>
</style>