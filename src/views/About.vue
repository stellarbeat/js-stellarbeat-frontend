<template>
    <div>
        <div class="page-header  mt-2">
            <h1 class="page-title">
                About
            </h1>
        </div>
        <b-card>
            <h5>Crawling the Stellar public network</h5>
            <p>
                <br>We want to make the Stellar network more tangible by making it visible.
                <br>To see how many nodes there are, where they are located, and how the network is growing and
                performing.

                <br><br>Since Stellar is a decentralised network, there is no easy way to get this information.
                <br>So we created a crawler that puts itself on the Stellar network and starts discovering nodes.
                <br><br>This works as follows:
            </p>
            <ol>
                <li>
                    Start with a list of known nodes.
                    <br>Right now this means 'use the result of our last run', but initially we started with a
                    list of known nodes that comes with the example configuration of stellar-core.
                </li>
                <li>
                    Connect to a node on the list and attempt to perform a basic 'hello' handshake.
                    <br>If they respond we consider the node active and store it.
                </li>
                <li>
                    Ask that active node to give us a list of its known peers.
                    <br>If the response contains nodes that we don't know yet, we put them on the crawler's to-do
                    list to be discovered and asked for peers too.
                </li>
                <li>
                    Listen to the node traffic to gather it's quorumset information
                </li>
            </ol>
            <p>
                We end up with a full list of active nodes and their quorumsets in the network.
            </p>
            <p>
                If you want to learn more or give us some feedback go to <a href="https://github.com/stellarbeat"
                                                                            class="btn btn-sm bt btn-outline-primary"
                                                                            target="_blank"><i
                    class="fe fe-github"></i> Github</a> or contact us by
                <a href="mailto:stellarbeatio@gmail.com"
                   class="btn btn-sm bt btn-outline-primary" target="_blank"><i
                        class="fe fe-mail"></i> Mail</a>
            </p>

        </b-card>
    </div>
</template>

<script>
    export default {
        name: "about"
    }
</script>