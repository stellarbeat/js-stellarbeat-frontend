<template>
  <div>
    <div class="page-header mt-2">
      <h1 class="page-title">API</h1>
    </div>
    <div class="card">
      <div class="card-body">
        <dl>
          <dt>Networks</dt>
          <dd>
            <ul class="pl-1">
              <li>
                Public network:
                <a
                  href="https://api.stellarbeat.io"
                  target="_blank"
                  rel="noopener"
                  >https://api.stellarbeat.io</a
                >
              </li>
              <li>
                Test network:
                <a
                  href="https://api-testnet.stellarbeat.io"
                  target="_blank"
                  rel="noopener"
                  >https://api-testnet.stellarbeat.io</a
                >
              </li>
            </ul>
          </dd>
          <dt>Endpoints</dt>
          <dd>
            <ul class="pl-1">
              <li>/v1(?at=date)</li>
              <li>/v1/statistics?from=date&to=date</li>
              <li>/v1/day-statistics?from=date&to=date</li>
              <li>/v1/month-statistics?from=date&to=date</li>
              <li>/v1/node</li>
              <li>/v1/node/{publicKey}</li>
              <li>/v1/node/{publicKey}/statistics?from=date&to=date</li>
              <li>/v1/node/{publicKey}/day-statistics?from=date&to=date</li>
              <!--li>/v1/node/{publicKey}/snapshots(?at=date)</li!-->
              <li>/v1/organization</li>
              <li>/v1/organization/{organizationID}</li>
              <li>
                /v1/organization/{organizationID}/statistics?from=date&to=date
              </li>
              <li>
                /v1/organization/{organizationID}/day-statistics?from=date&to=date
              </li>
              <!--li>/v1/organization/{organizationID}/snapshots(?at=date)</li!-->
            </ul>
          </dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component({
  name: "api",
  metaInfo: {
    title: "API - Stellarbeat.io",
    meta: [
      { name: "description", content: "Connect your app through our api" },
    ],
  },
})
export default class Api extends Vue {}
</script>
<style scoped>
li {
  list-style: none;
}
</style>
