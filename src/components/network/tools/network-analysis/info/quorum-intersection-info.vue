<template>
    <b-modal lazy id="network-analysis-qi-info" ref="network-analysis-qi-info" hide-header>
        <h3>What is quorum intersection?</h3>
        <p class="my-4">
            A property of the network that indicates all quorums are overlapping.
        </p>
        <h3>Why is quorum intersection needed?</h3>
        <p class="my-4">
            Because it is prerequisite for network safety. If not all quorums overlap, they could make different
            decisions and thus split the network.
        </p>
        <h3>What are minimal quorums?</h3>
        <p class="my-4">
            A minimal quorum is a set of nodes that form a quorum but does not contain another quorum.
            If all minimal quorums intersect, it can be shown that the network has quorum intersection.
            If you want to learn more, check out the following <a target="_blank"
                                                                 href="https://arxiv.org/pdf/2002.08101.pdf">white
            paper</a>.
        </p>
        <template v-slot:modal-footer>
            <div class="w-100">
                <p class="float-left">Powered by <a target="_blank" href="https://github.com/wiberlin/fbas_analyzer">wiberlin/fbas_analyzer</a>
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
    export default class QuorumIntersectionInfo extends Mixins(StoreMixin) {
        hideModal() {
            (this.$refs['network-analysis-qi-info'] as any).hide();
        }
    }
</script>