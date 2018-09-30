<template>
    <li class="list-group-item">
        <h6>Quorumset with threshold: {{quorumSet.threshold}}</h6>
        <ul>
            <li v-for="validator in quorumSet.validators" class="list-group-item">
                {{validatorDisplayName(validator)}}
            </li>
            <quorum-set v-for="innerQuorumSet in quorumSet.innerQuorumSets" :network="network"
                        :quorumSet="innerQuorumSet"></quorum-set>
        </ul>
    </li>
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
        methods: {
            validatorDisplayName: function (validator) {
                if (this.network.getNodeByPublicKey(validator)) {
                    return this.network.getNodeByPublicKey(validator).displayName;
                } else {
                    return validator;
                }
            }
        }
    }
</script>

<style scoped>
    .active-node {
        color: #1997c6;
    }
    li {
        padding-left: 0px;
    }
</style>