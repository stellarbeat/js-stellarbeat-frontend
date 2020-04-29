<template>
    <div class="d-flex">
        <b-button-group>
            <b-button :disabled="!canGoBack()" class="left" v-on:click="$emit('goBack')">
                <b-icon-chevron-left/>
            </b-button>
            <div>
                <b-datepicker v-if="!showTime" :dark="true" v-model="datePickerDate" class="date-picker"
                              :date-format-options="{ year: 'numeric', month: 'short', day: '2-digit'}"
                              :min="minSelectedDate" :max="new Date()">
                    <template v-slot:button-content><b-icon-calendar class="text-gray"/></template>
                </b-datepicker>
                <b-timepicker v-else v-model="time" class="time-picker"
                              @hidden="timeInputHandler" :key="time">
                    <template v-slot:button-content></template>
                </b-timepicker>
            </div>
            <b-button @click="timeTravel" variant="secondary" class="time-travel-btn" v-b-tooltip.hover
                      title="Travel to selected time">
                <b-icon-clock/>
            </b-button>
            <b-button v-on:click="$emit('goForward')" class="right">
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

    @Component({
        name: 'date-navigator',
        components: {
        }
    })
    export default class DateNavigator extends Vue {
        @Prop()
        selectedDate!: Date;
        @Prop()
        minSelectedDate!: Date;
        @Prop({default: false})
        showTime!: boolean;

        datePickerDate: Date = this.selectedDate;
        time: string = moment(this.selectedDate).format('HH:mm');

        @Watch('selectedDate')
        onSelectedDateChanged() {
            this.datePickerDate = this.selectedDate;
            this.time = moment(this.selectedDate).format('HH:mm');
        }

        @Watch('datePickerDate', {})
        async onDatePickerDateChanged(to: string, from: string) {
            if (this.datePickerDate && from !== null && this.selectedDate !== this.datePickerDate) {
                this.$emit('dateChanged', this.datePickerDate);
            }
        }

        timeInputHandler() {
            if (this.time !== moment(this.selectedDate).startOf('minutes').format('HH:mm:ss')) {
                this.$emit('dateChanged', moment(this.selectedDate).hours(Number(this.time.substr(0, 2))).minutes(Number(this.time.substr(3, 2))).toDate());
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
    .time-travel-btn {
        color: #1997c6;
        border-radius: 0;
    }
    .time-picker {
        border-radius: 0;
        border-left:0;
        width: 125px;
        height: 100% !important;
        animation: highlight 1s;
    }
    .date-picker {
        border-radius: 0;
        border-left:0;
    }
</style>