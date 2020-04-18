<template>
    <div class="d-flex">
        <b-button :disabled="!canGoBack()" size="sm" class="left" v-on:click="$emit('goBack')"><i
                class="fe fe-chevron-left"/></b-button>
        <datepicker v-model="datePickerDate" :disabledDates="disabledDates"
                    :input-class="'date-picker-input-white date-picker-input-white-no-border'"
                    :wrapper-class="'date-picker-wrapper'"
                    :bootstrap-styling="true"/>
        <vue-timepicker v-if="showTime" hide-clear-button input-width="6em" input-class="timepicker-no-border-right"
                        v-model="timePickerTime" @input="timeInputHandler"/>
        <b-button @click="timeTravel" variant="secondary" size="md" class="time-travel-btn" v-b-tooltip.hover
                  title="Travel to selected time"><i class="fe fe-clock"></i>
        </b-button>
        <b-button size="sm" v-on:click="$emit('goForward')" class="right"><i class="fe fe-chevron-right"/>
        </b-button>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import Datepicker from 'vuejs-datepicker';
    import VueTimePicker from 'vue2-timepicker';
    import 'vue2-timepicker/dist/VueTimepicker.css';
    import moment from 'moment';

    @Component({
        name: 'date-navigator',
        components: {
            datepicker: Datepicker,
            'vue-timepicker': VueTimePicker
        }
    })
    export default class DateNavigator extends Vue {
        @Prop()
        selectedDate!: Date;
        @Prop()
        minSelectedDate!: Date;
        @Prop({default: false})
        showTime!: boolean;

        datePickerDate: string = this.selectedDate.toDateString();
        timePickerTime: { HH: string, mm: string } = {
            HH: moment(this.selectedDate).format('HH'),
            mm: moment(this.selectedDate).format('mm')
        };
        disabledDates: any = {
            to: this.minSelectedDate,
            from: new Date()
        };

        @Watch('selectedDate')
        onSelectedDateChanged() {
            this.datePickerDate = this.selectedDate.toDateString();
            this.timePickerTime = {
                HH: moment(this.selectedDate).format('HH'),
                mm: moment(this.selectedDate).format('mm')
            };
        }

        @Watch('datePickerDate', {})
        async onDatePickerDateChanged(to: string, from: string) {
            if (this.datePickerDate && from !== null && this.selectedDate.toDateString() !== this.datePickerDate) {
                this.$emit('dateChanged', this.datePickerDate);
            }
        }

        timeInputHandler(time: { HH: string, mm: string, ss: string }) {
            if (time.HH !== moment(this.selectedDate).format('HH')) {
                this.$emit('dateChanged', moment(this.selectedDate).hours(Number(time.HH)).minutes(Number(time.mm)).toDate());
            }
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        canGoBack() {
            return this.selectedDate > this.minSelectedDate;
        }

        async timeTravel() {
            this.store.isLoading = true;
            await this.store.fetchData(this.selectedDate);
            this.store.isLoading = false;
        }
    }
</script>

<style scoped>
    .right {
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
        height: 38px;
    }

    .left {
        border-bottom-right-radius: 0;
        border-top-right-radius: 0;
        height: 38px;
    }

    .time-travel-btn {
        color: #1997c6;
        border-radius: 0;
        border-right: none;
        height: 38px;
    }
</style>