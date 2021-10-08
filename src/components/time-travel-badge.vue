<template>
  <span v-if="store.isTimeTravel && !store.isSimulation" class="tag mx-2"
    >Time Travel
    <a href="#" v-on:click.stop.prevent="resetTimeTravel()" class="tag-addon"
      ><b-icon-x />
    </a>
  </span>
</template>
<script lang="ts">
import Store from "@/store/Store";
import Vue from "vue";
import { BIconX } from "bootstrap-vue";
import { Component } from "vue-property-decorator";

@Component({
  components: { BIconX: BIconX },
})
export default class TimeTravelBadge extends Vue {
  get store(): Store {
    return (this as any).$root.$data.store;
  }

  resetTimeTravel() {
    let query = this.store.copyAndModifyObject(this.$route.query, [], ["at"]);
    this.$router.push({
      name: this.$route.name ? this.$route.name : undefined,
      params: this.$route.params,
      query: query,
    });
  }
}
</script>
<style scoped>
.tag-close-btn {
  text-decoration: none;
}
</style>
