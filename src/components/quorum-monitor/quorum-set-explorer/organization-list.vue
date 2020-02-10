<template>
    <div class="pt-0">
        <div class="list-group list-group-flush nested-tree">
            <div class="list-group-item p-1 pr-0 node-list"
                 v-for="org in paginatedOrganizations">
                <a href="#" class="node-link active"
                   v-on:click.prevent.stop="selectOrganization(org)">
                    <span v-b-tooltip.hover title="Tier one organization" v-if="org.isTierOneOrganization" class="badge sb-badge badge-primary">
                            <i class="fe fe-shield"/>
                        </span>
                        {{org.name}}
                </a>
            </div>
            <div class="pagination" v-if="organizations.length > 10">
                <b-pagination size="sm"
                              v-model="currentPage"
                              :total-rows="totalRows"
                              :per-page="perPage"
                ></b-pagination>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Organization} from '@stellarbeat/js-stellar-domain';
    import Store from "@/store/Store";

    @Component({
        name: "organization-list",
        components: {
        },
    })
    export default class OrganizationList extends Vue {
        @Prop()
        public organizations!: Organization[];
        @Prop()
        public title!: string;
        @Prop({default: true})
        public renderTitle!: boolean;

        protected currentPage: number = 1;
        protected perPage: number = 10;

        get store():Store {
            return this.$root.$data.store;
        }

        get paginatedOrganizations() {
            return this.organizations
                .slice(
                    (this.currentPage - 1) * this.perPage, this.currentPage * this.perPage
                );
        }

        get totalRows() {
            return this.organizations.length;
        }

        public selectOrganization(organization: Organization) {
            this.$router.push({
                name: "organization-details",
                params: {organizationId: organization.id}
            });
        }

    }
</script>

<style scoped>
    .node-list {
        display: flex;
        justify-content: space-between;
        margin-left: 20px;
    }

    .node-link {
        width: 100%;
    }

    .active {
        color: #1997c6
    }

    a:hover, a:visited, a:link, a:active {
        text-decoration: none;
    }

    a:hover {
        background-color: #f8f9fa;
    }

    .chevron {
        float: left;
    }

    .nodes-title {
        cursor: pointer;
    }
    .nodes-title:hover {
        background-color: #f8f9fa;
    }

    .pagination {
        margin-left: 10px;
        margin-top: 5px;
    }

</style>


