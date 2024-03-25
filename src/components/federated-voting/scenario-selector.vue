<template>
  <div>
    <select
      id="scenario"
      class="fv-dropdown"
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
