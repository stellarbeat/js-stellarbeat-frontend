<template>
    <b-modal id="quorumSlicesModal" lazy v-on:show="loadSlices" size="xl" hide-header>
        <div>
            <b-alert variant="info" show>The node itself is added to every slice</b-alert>
            <b-table id="network-analysis-table" striped hover
                     :fields="fields"
                     :items="items"
                     :per-page="perPage" thead-class="my-thead"
                     tbody-class="my-tbody" :current-page="currentPage">
                <template #cell(slice)="data">
                    {{ data.item.slice.map(publicKey => network.getNodeByPublicKey(publicKey).displayName).join(', ') }}
                </template>
            </b-table>
            <b-pagination
                    v-model="currentPage"
                    :total-rows="rows"
                    :per-page="perPage"
                    aria-controls="network-analysis-table"
            ></b-pagination>
        </div>
    </b-modal>
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
        BCardHeader,
        BAlert
    } from 'bootstrap-vue';
    import {Node, QuorumSet, QuorumSlicesGenerator} from '@stellarbeat/js-stellar-domain';
    import {StoreMixin} from '@/mixins/StoreMixin';

    @Component({
        components: {
            BAlert,
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
    export default class QuorumSlices extends Mixins(StoreMixin) {

        @Prop()
        protected selectedNode!:Node;
        protected perPage: number = 10;
        protected currentPage: number = 1;
        protected items:any[] = [];
        protected fields:any = [{ key: 'slice', label: 'slices'}];

        get rows() {
            return this.items.length;
        }

        get length() {
            return this.items.length;
        }

        loadSlices() {
            let generator = new QuorumSlicesGenerator(false);
            let quorumSetWithSelf = new QuorumSet('temp', 2, [this.selectedNode.publicKey], [this.selectedNode.quorumSet]) ;
            this.items = generator.getSlices(quorumSetWithSelf).map(slice => { return {"slice": Array.from(new Set(slice))}});
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