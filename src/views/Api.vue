<template>
    <div>
        <div class="page-header  mt-2">
            <h1 class="page-title">
                API
            </h1>
        </div>
        <div class="card">
            <div class="card-body">
                <dd><a href="https://api.stellarbeat.io" target="_blank">https://api.stellarbeat.io</a></dd>
                <ul class="pl-0">
                    <li>/v1/network/stellar-public(?at=date)</li>
                    <li>/v1/network/stellar-public/statistics?from=date&to=date</li>
                    <li>/v1/network/stellar-public/day-statistics?from=date&to=date</li>
                    <li>/v1/network/stellar-public/month-statistics?from=date&to=date</li>
                    <li>/v1/network/stellar-public/node</li>
                    <li>/v1/network/stellar-public/node/{publicKey}</li>
                    <li>/v1/network/stellar-public/node/{publicKey}/statistics?from=date&to=date</li>
                    <li>/v1/network/stellar-public/node/{publicKey}/day-statistics?from=date&to=date</li>
                    <!--li>/v1/network/stellar-public/node/{publicKey}/snapshots(?at=date)</li!-->
                    <li>/v1/network/stellar-public/organization</li>
                    <li>/v1/network/stellar-public/organization/{organizationID}</li>
                    <li>/v1/network/stellar-public/organization/{organizationID}/statistics?from=date&to=date</li>
                    <li>/v1/network/stellar-public/organization/{organizationID}/day-statistics?from=date&to=date</li>
                    <!--li>/v1/network/stellar-public/organization/{organizationID}/snapshots(?at=date)</li!-->
                </ul>

            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {Component} from 'vue-property-decorator';

@Component({
    name: 'api',
    metaInfo: {
        title: 'API - Stellarbeat.io',
        meta: [
            {name: 'description', content: 'Connect your app through our api'},
        ],
    },
})
export default class Api extends Vue {
}
</script>
<style scoped>
    li {
        list-style: none;
    }
</style>