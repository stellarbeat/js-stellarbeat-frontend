<template>
    <div>
        <div class="page-header  mt-2">
            <h1 class="page-title">
                Help
            </h1>
        </div>
        <div class="card">
            <div class="card-body">
                <h2>How can I add my node?</h2>
                <p>
                    Give insight into the Stellar public network through various tools & visualizations.
                </p>
                <h2>How can I update the name of my node?</h2>
                <p>
                    Give insight into the Stellar public network through various tools & visualizations.
                </p>
                <h2>How can I add my organization?</h2>
                <p>
                    Give insight into the Stellar public network through various tools & visualizations.
                </p>
                <h2>How do I gain full validator status?</h2>
                <p>
                    Give insight into the Stellar public network through various tools & visualizations.
                </p>
                <h2>What is the node index?</h2>
                <p>
                    Give insight into the Stellar public network through various tools & visualizations.
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component} from "vue-property-decorator";

    @Component({
        name: "help",
        metaInfo: {
            title: "Help - Stellarbeat.io",
            meta: [
                {name: "description", content: "Help faq"},
            ],
        },
    })
    export default class About extends Vue {
    }
</script>