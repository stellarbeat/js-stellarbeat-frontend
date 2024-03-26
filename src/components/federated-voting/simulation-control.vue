<template>
  <nav class="card navbar">
    <div class="button-group">
      <button class="btn btn-primary navbar-item" @click="backward">
        <i class="bi bi-arrow-counterclockwise-fill icon-color"></i>
      </button>
      <button
        v-if="!isPlaying"
        class="btn btn-primary navbar-item"
        @click="play"
      >
        <i class="bi bi-play-fill icon-color"></i>
      </button>
      <button v-else class="btn btn-primary navbar-item" @click="pause">
        <i class="bi bi-pause-fill icon-color"></i>
      </button>
      <button class="btn btn-primary navbar-item" @click="forward">
        <i class="bi bi-arrow-clockwise-fill icon-color"></i>
      </button>
    </div>

    <scenario-selector />
  </nav>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ScenarioSelector from "@/components/federated-voting/scenario-selector.vue";

const isPlaying = ref(false);

const backward = () => {};

const forward = () => {};

const play = () => {
  isPlaying.value = true;
};

const pause = () => {
  isPlaying.value = false;
};
</script>

<style scoped>
.navbar {
  display: flex;
  padding: 1em;
  justify-content: space-between;
  flex-direction: row;
  background-color: white;
}

.icon-color {
  color: gray;
}

.button-group {
  display: flex;
  gap: 1em;
}

.navbar-item {
  padding: 0.5em 1em;
  background-color: white;
  color: gray;
  border: 1px solid lightgray;
  border-radius: 5px;
  cursor: pointer;
}
</style>
