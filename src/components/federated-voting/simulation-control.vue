<template>
  <nav class="card navbar">
    <div class="button-group">
      <b-button @click="backward" class="navbar-item">
        <b-icon-arrow-counterclockwise class="icon-color" />
      </b-button>
      <b-button v-if="!isPlaying" @click="play" class="navbar-item">
        <b-icon-play-fill class="icon-color" />
      </b-button>
      <b-button v-else @click="pause" class="navbar-item">
        <b-icon-pause-fill clas="icon-color" />
      </b-button>
      <b-button @click="forward" class="navbar-item">
        <b-icon-arrow-clockwise class="icon-color" />
      </b-button>
    </div>

    <scenario-selector />
  </nav>
</template>

<script setup lang="ts">
import {
  BButton,
  BIconPlayFill,
  BIconPauseFill,
  BIconArrowCounterclockwise,
  BIconArrowClockwise,
} from "bootstrap-vue";
import { ref } from "vue";
import ScenarioSelector from "@/components/federated-voting/scenario-selector.vue";

const isPlaying = ref(false);

const backward = () => {
  console.log("Backward button clicked");
};

const forward = () => {
  console.log("Forward button clicked");
};

const play = () => {
  console.log("Play button clicked");
  isPlaying.value = true;
};

const pause = () => {
  console.log("Pause button clicked");
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
