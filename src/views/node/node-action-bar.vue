<template>
    <div style="font-size: 0.5rem;">
        <button type="button" class="btn btn-xs btn-secondary" data-toggle="modal"
                v-bind:data-target="'#' + modalId">
            <font-awesome-icon size="xs" icon="info"/>
        </button>
        <button type="button" class="btn btn-xs"
                v-on:click.prevent.stop="$emit('node-toggle-active', node)"
                v-bind:class="[node.active ? 'btn-success' : 'btn-secondary']">
            <font-awesome-icon size="xs" icon="power-off"/>
        </button>
        <div class="modal" v-bind:id="modalId" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{node.displayName}}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Todo: layout</p>
                        <div v-for="(value, key) in node">
                            {{ key }}: {{ value }}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    export default {
        name: "node-action-bar",
        props: {
            node: {
                type: Object
            },
            network: {
                type: Object
            }
        },
        computed: {
            modalId: function () {
                return this.node.publicKey
            }
        }
    }
</script>

<style scoped>
    .btn-group-xs > .btn, .btn-xs {
        padding  : .25rem .25rem;
        font-size  : .875rem;
        line-height  : .5;
        border-radius : .2rem;
    }
</style>


