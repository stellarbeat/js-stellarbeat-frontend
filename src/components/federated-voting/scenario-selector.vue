<template>
  <div>
    <select
      class="fv-dropdown"
      id="scenario"
      :value="federatedVotingStore.selectedScenario"
    >
      <option
        v-for="scenario in federatedVotingStore.scenarios"
        :key="scenario"
        :value="scenario"
      >
        {{ scenario }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { federatedVotingStore } from "@/store/useFederatedVotingStore";
</script>

<style scoped></style>
