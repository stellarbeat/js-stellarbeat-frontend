<template>
    <div>
        <div>Threshold: {{quorumSet.threshold}}</div>
        <div v-show="quorumSet.validators.length > 0">Validators:
        <ul class="list-group list-group-flush">
            <li v-for="validator in quorumSet.validators" class="list-group-item"> {{validatorDisplayName(validator)}}
            </li>
        </ul>
        </div>
        <div v-show="quorumSet.innerQuorumSets.length > 0">Inner QuorumSets:
        <quorum-set v-for="innerQuorumSet in quorumSet.innerQuorumSets" :network="network"
                   :quorumSet="innerQuorumSet"></quorum-set>
        </div>
    </div>
</template>

<script>
    export default {
        name: "quorum-set",
        props: {
            "network": {
                type: Object
            },
            "quorumSet": {
                type: Object
            }
        },
        methods:{
            validatorDisplayName: function (validator) {
                if(this.network.getNodeByPublicKey(validator)) {
                    return this.network.getNodeByPublicKey(validator).displayName;
                } else {
                    return validator;
                }
            }
        }
    }
</script>

<style scoped>

</style>