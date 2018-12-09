<template>
    <div>
        <div class="page-header  mt-2">
            <h1 class="page-title">
                About
            </h1>
        </div>
        <div class="card">
            <div class="card-body">
            <h2>Goal</h2>
            <p>
                Give insight into the Stellar public network through various tools & visualizations.
            </p>

            <h3>Crawler</h3>
            <p>
                Every 10 minutes we crawl the stellar public network to gather all available nodes.

                The crawler also listens for five minutes to the traffic in the network to determine if a node is
                participating in the Stellar consensus protocol.
            </p>
            <h3>Node information & statistics</h3>
            <ul>
                <li>
                    Available node: The crawler succeeded at least one time to connect to the node and send commands.
                </li>
                <li>
                    Active node: The crawler can connect to the node and send commands. This should happen at least once
                    in the latest 300 crawls. The availability score of the node gives the percentage of time the node
                    was active in the latest 300 crawls.
                </li>
                <li>
                    Node availability status: Percentage of time the node was active in the latest 300 crawls.
                </li>
                <li>
                    Node load: Metric that shows how many times an <a
                        href="https://github.com/stellar/stellar-core/blob/master/src/xdr/Stellar-overlay.x">ERR_LOAD</a>
                    message is received in the latest 300 crawls.
                </li>
                <li>
                    Validator: The crawler picks up "stellar consensus protocol" messages about the node and
                    successfully
                    requests its quorum set configuration.
                </li>
                <li>
                    Failing validator: The quorum set configuration of the node does not meet its threshold. Either
                    because the trusted validators are inactive, or failing.
                </li>
                <li>
                    Node geo data: Lookup of node ip in <a href="https://ipstack.com/">ipstack API</a>
                </li>
            </ul>

            <h2>Open source</h2>
            <p>
                All code is available on <a href="https://github.com/stellarbeat"
                                            class="btn btn-sm bt btn-outline-primary"
                                            target="_blank"><i
                    class="fe fe-github"></i> Github</a>
            </p>

            <h2>Contact</h2>
            <p>
                <a href="mailto:stellarbeatio@gmail.com"
                   class="btn btn-sm bt btn-outline-primary" target="_blank"><i
                        class="fe fe-mail"></i> Mail</a>
            </p></div>

        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({
    name: 'about',
    metaInfo: {
        title: 'About - Stellarbeat.io',
        meta: [
            {name: 'description', content: 'About and contact info'},
        ],
    },
})
export default class About extends Vue {
}
</script>