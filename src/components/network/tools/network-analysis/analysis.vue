<template>
    <div class="">
        <slot name="title"></slot>
        <div>
            <b-table id="network-analysis-table" striped hover :fields="fields"
                     :items="items"
                     :per-page="perPage" thead-class="my-thead"
                     tbody-class="my-tbody" :current-page="currentPage">
                <template v-slot:head(minimalQuorums)="data">
                    <span class="dl-header">{{data.label}}</span>
                </template>
            </b-table>
            <b-pagination
                    v-model="currentPage"
                    :total-rows="rows"
                    :per-page="perPage"
                    aria-controls="network-analysis-table"
            ></b-pagination>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Mixins, Prop} from 'vue-property-decorator';
    import {
        BFormInput,
        BModal,
        BButton,
        BFormCheckbox,
        BFormSelect,
        BTable,
        BPagination,
        BBadge,
        BCard,
        BCardBody,
        BCardText,
        BCollapse,
        VBToggle,
        BCardHeader
    } from 'bootstrap-vue';
    import {Node, PublicKey} from '@stellarbeat/js-stellar-domain';
    import {StoreMixin} from '@/mixins/StoreMixin';

    @Component({
        components: {
            BFormInput,
            BModal,
            BButton,
            BFormCheckbox,
            BFormSelect,
            BTable,
            BPagination,
            BBadge,
            BCard,
            BCardBody,
            BCardText,
            BCollapse,
            BCardHeader
        },
        directives: {'b-toggle': VBToggle}
    })
    export default class Analysis extends Mixins(StoreMixin) {
        @Prop()
        items!: any;
        @Prop()
        fields: any;

        protected perPage: number = 5;
        protected currentPage: number = 1;

        get rows() {
            return this.items.length;
        }
    }
</script>
<style>
    .my-thead tr th {
        color: #495057;
        text-transform: none;
        font-size: 0.9375rem;
        font-weight: 700;

    }

    .my-tbody tr td {

    }
</style>