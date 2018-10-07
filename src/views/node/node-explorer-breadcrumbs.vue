<template>
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="#">Home</a></li>
            <li class="breadcrumb-item"><a href="#">Library</a></li>
            <li class="breadcrumb-item active" aria-current="page">Data</li>
        </ol>
    </nav>
</template>

<script>
    export default {
        name: "node-explorer-breadcrumbs",
        props: {
            node: {
                type: Object
            }
        }
    }
</script>

<style scoped>

</style>


