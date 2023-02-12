<template>
  <div>
    <div class="page-header mt-2 py-3">
      <h1 class="page-title">FAQ</h1>
    </div>
    <div class="card">
      <div class="card-body">
        <h3>How does Stellarbeat work?</h3>
        <p>
          Every 3 minutes we crawl the Stellar public network to gather all
          available nodes and pickup scp messages to determine if a node is
          participating in the Stellar consensus protocol.
        </p>
        <h3>How can I add my node?</h3>
        <p>
          The crawler will pick it up automatically when it is active in the
          public network and another node advertises it.
        </p>
        <h3>Why is my node not showing up?</h3>
        <p>
          A common issue is a closed port (default: 11625). Send us an
          <a href="mailto:info@stellarbeat.io" target="_blank" rel="noopener">
            e-mail</a
          >
          if the problem persists.
        </p>
        <h3>How can I update the name of my validator?</h3>
        <p>
          Support
          <a
            target="_blank"
            rel="noopener"
            href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0020.md"
            >sep-0020</a
          >
          and update the linked
          <a
            target="_blank"
            rel="noopener"
            href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md"
            >stellar.toml</a
          >
          file to include your validator info.
        </p>
        <h3>How do I gain full validator status?</h3>
        <p>
          Support
          <a
            target="_blank"
            rel="noopener"
            href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0020.md"
            >sep-0020</a
          >
          and update the linked
          <a
            target="_blank"
            rel="noopener"
            href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md"
            >stellar.toml</a
          >
          file to include your history archive url's and make sure the
          archive(s) are up-to-date.
        </p>
        <h3>What is organization subquorum availability?</h3>
        <p>
          Validators can add the validators of an organization to their
          quorumset. If 50% or more of the validators of an organization are
          validating correctly, this subquorum is marked as available.
        </p>
        <h3>What is a tier one organization</h3>
        <p>
          A tier one organization has at least three validators and subquorum
          availability of at least 99 percent over 30 days.
        </p>
        <h3>What is the node index?</h3>
        <p>
          The node index gives nodes a basic ranking through the following
          formula:
        </p>
        <pre><code>
Index = (TypeIndex + ActiveIndex + ValidationIndex + VersionIndex + TrustIndex + AgeIndex)/6

TypeIndex = Full validator | Basic validator | Watcher node
ActiveIndex = Active percentage last 30 days
ValidationIndex = Validation percentage last 30 days
Version = How far away from the latest stable Stellar core version
Trust = How many active validators trust this node
Age = Time since discovery
                        </code></pre>
        <h3>Why is my validator 'overloaded'?</h3>
        <p>
          When your validator disconnects from the crawler with an
          <a
            target="_blank"
            rel="noopener"
            href="https://github.com/stellar/stellar-core/blob/cc6208b268d3102381c4e2502fcbb6e3afd4249a/src/xdr/Stellar-overlay.x#L16"
            >err_load</a
          >
          message, it is marked as overloaded. It indicates how easily new nodes
          can connect to your validator. A possible solution is to increase
          MAX_ADDITIONAL_PEER_CONNECTIONS (inbound connections). Another way a
          node is marked overloaded when it takes too long to send/process
          messages. In this case you will see a high cpu usage on your node.
        </p>
        <h3>How can I add my organization?</h3>
        <p>
          Support
          <a
            target="_blank"
            rel="noopener"
            href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0020.md"
            >sep-0020</a
          >
          and update the linked
          <a
            target="_blank"
            rel="noopener"
            href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md"
            >stellar.toml</a
          >
          file to include your organization info.
        </p>
        <h3>Where can I find the code?</h3>
        <p>
          All code is open-source and available on
          <a
            href="https://github.com/stellarbeat"
            class="btn btn-sm bt btn-outline-primary"
            rel="noopener"
            target="_blank"
            ><github /> Github</a
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Github from "@/components/organization/logo/github.vue";
</script>
<script lang="ts">
export default {
  metaInfo: {
    title: "FAQ - Stellarbeat",
    meta: [{ name: "Frequently asked questions", content: "Help faq" }],
  },
};
</script>
