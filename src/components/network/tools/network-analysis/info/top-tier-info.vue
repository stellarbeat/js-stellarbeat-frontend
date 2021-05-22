<template>
    <b-modal lazy id="network-analysis-top-tier-info" ref="network-analysis-top-tier-info" hide-header>
        <h3>Top tier</h3>
        <p class="my-4">
            The top tier is the set of nodes in the network that is exclusively relevant when determining the liveness and safety "buffers" of the network. These nodes can be grouped by organization, country and isp.
        </p>

        <h3>When is the top tier symmetric?</h3>
        <p class="my-4">
            The top tier is symmetric when all of its nodes have the same quorumset configuration.
        </p>

        <h3>Learn more</h3>
        <p class="my-4">
            If you want to learn more about the top tier concept, check out the following
            <a target="_blank" rel="noopener" href="https://arxiv.org/pdf/2002.08101.pdf">white paper</a>
        </p>
        <template v-slot:modal-footer>
            <div class="w-100">
                <p class="float-left">Powered by <a target="_blank" rel="noopener" href="https://github.com/wiberlin/fbas_analyzer">wiberlin/fbas_analyzer</a>
                </p>
                <b-button
                        variant="primary"
                        size="sm"
                        class="float-right"
                        @click="hideModal"
                >
                    Close
                </b-button>
            </div>
        </template>
    </b-modal>
</template>

<script lang="ts">
    import {Component, Mixins} from 'vue-property-decorator';
    import {
        BModal,
        BButton
    } from 'bootstrap-vue';
    import {StoreMixin} from '@/mixins/StoreMixin';

    @Component({
        components: {
            BModal,
            BButton
        }
    })
    export default class TopTierInfo extends Mixins(StoreMixin) {
        hideModal() {
            (this.$refs['network-analysis-top-tier-info'] as any).hide();
        }
    }
</script>