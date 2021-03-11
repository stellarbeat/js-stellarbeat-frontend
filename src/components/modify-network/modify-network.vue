<template>
    <div>
        <div v-if="visible"> <!--todo: modal!-->
            <b-form-textarea
                @input="modified = true"
                id="textarea"
                v-model="modifiedNetworkString"
                placeholder="Paste your custom network here"
                rows="20"
                max-rows="20"
                :state="isValid"
            ></b-form-textarea>
            <div v-if="!isValid">
                {{validationErrors}}
            </div>
            <b-button variant="primary" v-if="isValid && !modified" @click="load">
                Load
            </b-button>
            <b-button v-else variant="primary" @click="validate">
                Validate JSON
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
import {Node, Organization, QuorumSet} from '@stellarbeat/js-stellar-domain';
import {ModifyNetwork as ModifyNetworkChange} from '@/services/change-queue/changes/modify-network';

@Component({
    components: {BFormTextarea,BButton},
    directives: {}
})
export default class CustomNetwork extends Mixins(StoreMixin) {
    @Prop({
        default: true
    })
    visible!: boolean;

    modifiedNetworkString!: string;
    modifiedNetwork!: {
        nodes: {
            publicKey: string,
            countryCode: string,
            name: string,
            isp: string
            quorumSet: any
        }[],
        organizations: {
            name: string,
            id: string,
            validators: string[]
        }[]
    };
    isValid:boolean = false;
    modified:boolean = false;
    validationErrors: [] = [];

    validate(){
        console.log("validate");
        this.modifiedNetwork = JSON.parse(this.modifiedNetworkString);
        this.isValid = validate(this.modifiedNetwork);
        this.validationErrors = validate.errors;
        this.modified = false;
    }

    load(){
        let nodes = this.modifiedNetwork.nodes.map(basicNode => {
            let node = new Node(basicNode.publicKey);
            node.name = basicNode.name;
            node.geoData.countryCode = basicNode.countryCode;
            node.geoData.countryName = basicNode.countryCode;
            console.log(JSON.stringify(basicNode.quorumSet));
            node.quorumSet = QuorumSet.fromJSON(JSON.stringify(basicNode.quorumSet));
            node.isp = basicNode.isp;
            node.isValidating = true; //we set all nodes as validating by default
            return node;
        })

        let organizations = this.modifiedNetwork.organizations.map(basicOrganization => {
            let organization = new Organization(basicOrganization.id, basicOrganization.name);
            organization.validators = basicOrganization.validators;
            organization.subQuorumAvailable = true; //we set all orgs as available by default
            return organization;
        })

        this.store.processChange(new ModifyNetworkChange(this.network, nodes, organizations));
    }

    created() {
        this.modifiedNetwork = {
            nodes: this.network.nodes
                .filter(node => node.isValidator)
                .map(node => {
                    return {
                        'publicKey': node.publicKey,
                        'name': node.displayName,
                        'quorumSet': node.quorumSet,
                        'countryCode': node.geoData.countryCode ? node.geoData.countryCode : 'N/A',
                        'isp': node.isp ? node.isp : 'N/A'
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
        this.modifiedNetworkString = JSON.stringify(this.modifiedNetwork, null, 2);
    }
}
</script>

<style scoped>

</style>