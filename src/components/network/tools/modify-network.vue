<template>
    <b-modal size="xl" v-model="modalVisible">
        <template #modal-header="{ close }">
            <h5 class="modal-title">Modify the network</h5>
            <!-- Emulate built in modal header close button action -->
            <b-button size="sm" aria-label="Close" variant="outline-default" @click="close()">
                <b-icon-x/>
            </b-button>

        </template>
        <template #default>
            <b-form-textarea
                @input="modified = true"
                id="textarea"
                v-model="modifiedNetworkString"
                placeholder="Paste your custom network here"
                rows="20"
                max-rows="20"
                :state="modified ? null : isValid"
            ></b-form-textarea>
            <div v-if="!isValid" class="mt-2">
                <b-list-group>
                    <b-list-group-item variant="danger" v-for="error in validationErrors">{{
                            error.message + (error.dataPath ? ' at ' + error.dataPath : '') + (error.params ? ' ( ' + Object.values(error.params)[0] + ' ) ' : '')
                        }}
                    </b-list-group-item>
                </b-list-group>
            </div>
            <b-button-group class="mt-2">
                <b-button @click="modifiedNetworkString = ''; isValid = false; validationErrors = []">Clear</b-button>
                <b-button @click="initModifiedNetworkString">Reset</b-button>
                <b-button v-clipboard="modifiedNetworkString">Copy JSON</b-button>
            </b-button-group>
        </template>
        <template #modal-footer="{ ok, cancel }">
            <b-button variant="default" @click="initModifiedNetworkString();cancel()">
                Cancel
            </b-button>
            <b-button v-if="isValid && !modified" variant="success" @click="load(); ok();">
                Load network
            </b-button>
            <b-button v-else variant="primary" @click="validate">
                Validate JSON
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator';
import {StoreMixin} from '@/mixins/StoreMixin';

const validate = require('@stellarbeat/js-stellar-domain/lib/network-schema');
import {
    BFormTextarea,
    BButton,
    BButtonGroup,
    BModal,
    BIconX,
    BListGroupItem, BListGroup,
    VBModal, VBTooltip
} from 'bootstrap-vue';
import {Node, NodeGeoData, Organization, QuorumSet} from '@stellarbeat/js-stellar-domain';
import {ModifyNetwork as ModifyNetworkChange} from '@/services/change-queue/changes/modify-network';

@Component({
    components: {BFormTextarea, BButton, BModal, BButtonGroup, BListGroup, BListGroupItem, BIconX},
    directives: {'b-modal': VBModal}
})
export default class CustomNetwork extends Mixins(StoreMixin) {
    modalVisible: boolean = false;

    modifiedNetworkString: string = '';
    modifiedNetwork: {
        nodes: any[],
        organizations: any[]
    } = {nodes: [], organizations: []};
    isValid: boolean = false;
    modified: boolean = false;
    validationErrors: { dataPath?: string, message: string, params: any }[] = [];

    showModal() {
        this.initModifiedNetworkString();
        this.modalVisible = true;
    }

    validate() {
        this.isValid = false;
        this.modified = false;
        try {
            this.modifiedNetwork = JSON.parse(this.modifiedNetworkString);
            this.isValid = validate(this.modifiedNetwork);
            this.validationErrors = validate.errors;
        } catch (error) {
            this.validationErrors = [{message: error.message, dataPath: undefined, params: undefined}];
        }

    }

    load() {
        let nodesMap = new Map<string, Node>();
        let nodes = this.modifiedNetwork.nodes.map(basicNode => {
            let node = Node.fromJSON(basicNode);
            node.isValidating = basicNode.isValidating === undefined ? true : basicNode.isValidating;
            node.active = basicNode.active === undefined ? true : basicNode.active;

            nodesMap.set(node.publicKey, node);
            return node;
        });
        let organizations: Organization[] = [];
        if (this.modifiedNetwork.organizations) {
            organizations = this.modifiedNetwork.organizations.map(basicOrganization => {
                let organization = Organization.fromJSON(basicOrganization);
                organization.validators = basicOrganization.validators;
                organization.validators.forEach(validatorPublicKey => {
                    let validator = nodesMap.get(validatorPublicKey);
                    if (!validator)
                        return;

                    validator.organizationId = organization.id;
                });
                organization.subQuorumAvailable = basicOrganization.subQuorumAvailable === undefined ? true : basicOrganization.subQuorumAvailable;
                return organization;
            });
        }

        this.store.processChange(new ModifyNetworkChange(this.network, nodes, organizations));
    }

    mapToBasicQuorumSet(quorumSet: QuorumSet) {
        let qSet: any = {};
        qSet.threshold = quorumSet.threshold;
        qSet.validators = quorumSet.validators;
        qSet.innerQuorumSets = quorumSet.innerQuorumSets.map(innerQSet => this.mapToBasicQuorumSet(innerQSet));

        return qSet;
    }

    initModifiedNetworkString() {
        this.modifiedNetwork = {
            nodes: this.network.nodes
                .filter(node => node.isValidator)
                .map(node => {
                    return {
                        'publicKey': node.publicKey,
                        'name': node.displayName,
                        'quorumSet': this.mapToBasicQuorumSet(node.quorumSet),
                        'geoData': {
                            'countryCode': node.geoData.countryCode ? node.geoData.countryCode : 'N/A',
                        },
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
        this.isValid = true;
    }

}
</script>

<style scoped>

</style>