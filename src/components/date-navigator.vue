<template>
    <div class="date-selector d-flex">
        <b-button :disabled="!canGoBack()" size="sm" v-on:click="$emit('goBack')"><i
                class="fe fe-chevron-left"/></b-button>
        <datepicker v-model="datePickerDate" :disabledDates="disabledDates"
                    :bootstrap-styling="true"/>
        <b-button size="sm" v-on:click="$emit('goForward')"><i class="fe fe-chevron-right"/>
        </b-button>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/Store';
    import Datepicker from 'vuejs-datepicker';

    @Component({
        name: 'date-navigator',
        components: {
            datepicker: Datepicker
        }
    })
    export default class DateNavigator extends Vue {
        @Prop()
        selectedDate!:Date;
        @Prop()
        minSelectedDate!:Date;

        datePickerDate: string = this.selectedDate.toDateString();
        disabledDates: any = {
            to: this.minSelectedDate,
            from: new Date()
        };

        @Watch('datePickerDate', {})
        async onDatePickerDateChanged(to: string, from: string) {
            if (this.datePickerDate && from !== null) {
                this.$emit('dateChanged', this.datePickerDate);
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