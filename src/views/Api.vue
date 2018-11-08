<template>
    <div>
        <div class="page-header  mt-2">
            <h1 class="page-title">
                API
            </h1>
        </div>
        <b-alert variant="warning" show>https://stellarbeat.io/nodes/raw is deprecated, please use api below.</b-alert>
        <b-card>
            <h2>
                API base url
            </h2>
            <p><a href="https://api.stellarbeat.io" target="_blank">https://api.stellarbeat.io</a></p>
            <h3>/v1/nodes</h3>
            <p>Node data from latest crawl result.</p>

            <a href="https://api.stellarbeat.io/v1/nodes" class="btn btn-primary" target="_blank"><i class="fe fe-external-link"></i>Try it out</a>
        </b-card>
    </div>
</template>

<script>
    export default {
        name: "api"
    }
</script>