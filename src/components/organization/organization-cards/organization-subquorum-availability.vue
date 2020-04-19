<template>
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Subquorum Availability
                <b-icon-info-circle class="text-gray" v-b-tooltip:hover="'Validators can add the validators of an organization to their quorumset. If 50% or more of the validators of an organization are validating correctly, this subquorum is marked as available.'"/>
            </h3>
        </div>
        <div class="card-body d-flex justify-content-around">
            <gauge width="90px" height="90px"
                   :value="organization.subQuorum24HoursAvailability" :max-value="100" title="24H Availability"
                   :centerText="+organization.subQuorum24HoursAvailability.toFixed(2) + '%'"
                   value-color="#5eba00" negative-value-color="#cd201f"/>
            <gauge width="90px" height="90px"
                   :value="organization.subQuorum30DaysAvailability" :max-value="100" title="24H Availability"
                   :centerText="+organization.subQuorum30DaysAvailability.toFixed(2) + '%'"
                   value-color="#5eba00" negative-value-color="#cd201f"/>
        </div>
    </div>
</template>
<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import Vue from 'vue';
    import {Organization} from '@stellarbeat/js-stellar-domain';
    import Gauge from '@/components/charts/gauge.vue';

    @Component({
        components: {Gauge}
    })
    export default class OrganizationSubQuorumAvailability extends Vue{
        @Prop()
        failAt!: number;
        @Prop()
        organization!: Organization;
    }
</script>