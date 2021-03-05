<template>
    <div>
        <div v-if="visible"> <!--todo: modal!-->
            <b-form-textarea
                id="textarea"
                v-model="data"
                placeholder="Paste your custom network here"
                rows="20"
                max-rows="20"
            ></b-form-textarea>
            <b-button variant="primary">
                Load
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator';
import {StoreMixin} from '@/mixins/StoreMixin';

const validate = require('@/generated/custom-network-validator');
import {
    BFormTextarea,
    BButton
} from 'bootstrap-vue';

@Component({
    components: {BFormTextarea,BButton},
    directives: {}
})
export default class CustomNetwork extends Mixins(StoreMixin) {
    @Prop({
        default: true
    })
    visible!: boolean;

    data: string = '';

    get customNetwork() {
        return {
            nodes: this.network.nodes
                .filter(node => node.isValidator)
                .map(node => {
                    return {
                        'publickey': node.publicKey,
                        'name': node.displayName,
                        'quorumset': node.quorumSet,
                        'countrycode': node.geoData.countryCode,
                        'isp': node.isp
                    };
                }),
            organizations: this.network.organizations
                .map(organization => {
                    return {
                        id: organization.id,
                        name: organization.name,
                        validators: organization.validators
                    };
                })
        };
    }

    mounted() {
        this.data = JSON.stringify(this.customNetwork, null, 2);
        console.log(validate(this.customNetwork));
        console.log(validate.errors);
    }
}
</script>

<style scoped>

</style>