<template>
    <div class="">
        <b-modal
                ok-only size="lg" id="network-analysis-modal"
                title="Network analysis"
        >
                Wasm integration in progress.
        </b-modal>
    </div>
</template>

<script lang="ts">
    import {Component, Mixins} from 'vue-property-decorator';
    import {BFormInput, BModal} from 'bootstrap-vue';
    import {StoreMixin} from '@/mixins/StoreMixin';

    @Component({
        components: {BFormInput, BModal}
    })
    export default class NetworkAnalysis extends Mixins(StoreMixin)
    {

    }
</script>
<style scoped>
</style>