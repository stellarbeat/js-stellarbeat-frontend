<template>
    <div>
        <div class="page-header  mt-2">
            <h1 class="page-title">
                API
            </h1>
        </div>
        <div class="card">
            <div class="card-body">
                <h2>
                    API base url
                </h2>
                <p><a href="https://api.stellarbeat.io" target="_blank">https://api.stellarbeat.io</a></p>
                <h3>/v1/nodes</h3>
                <p>Retrieve all nodes from latest crawl result.</p>
                <h3>/v1/nodes/{publicKey}</h3>
                <p>Retrieve a single node from latest crawl result.</p>
                <h3>/v1/organizations</h3>
                <p>Retrieve all organizations from latest crawl result.</p>
                <h3>/v1/organizations/{organizationID}</h3>
                <p>Retrieve a single organization from latest crawl result.</p>
                <a href="https://api.stellarbeat.io/docs" class="btn btn-primary" target="_blank">View documentation</a>
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