<template>
    <div>
        <div class="page-header  mt-2">
            <h1 class="page-title">
                API
            </h1>
        </div>
        <b-alert variant="warning" show>https://stellarbeat.io/nodes/raw is deprecated, please use api below.</b-alert>
        <div class="card">
            <div class="card-body">
                <h2>
                    API base url
                </h2>
                <p><a href="https://api.stellarbeat.io" target="_blank">https://api.stellarbeat.io</a></p>
                <h3>/v1/nodes</h3>
                <p>Node data from latest crawl result.</p>
                <a href="https://api.stellarbeat.io/docs" class="btn btn-primary" target="_blank"><i
                        class="fe fe-external-link"></i>View documentation</a>
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