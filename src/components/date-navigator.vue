<template>
    <div class="date-selector d-flex">
        <b-button :disabled="!canGoBack()" size="sm" v-on:click="$emit('goBack')"><i
                class="fe fe-chevron-left"/></b-button>
        <datepicker v-model="datePickerDate" :disabledDates="disabledDates" :input-class="'date-picker-input-white'" :wrapper-class="'date-picker-wrapper'"
                    :bootstrap-styling="true"/>
        <vue-timepicker v-if="showTime" hide-clear-button input-width="5em" class="" v-model="timePickerTime" @input="timeInputHandler"/>
        <b-button size="sm" v-on:click="$emit('goForward')"><i class="fe fe-chevron-right"/>
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
    }
</script>

<style scoped>


</style>
<style>

</style>