<template>
  <div v-if="!error">
    <div v-if="unsubscribing">
      <h4>Unsubscribing</h4>
      <div>
        <div class="loader"></div>
      </div>
    </div>
    <div>
      <b-alert variant="success" show>Unsubscribed</b-alert>
    </div>
  </div>
  <div v-else>
    <h4>{{ errorMessage }}</h4>
    <b-button variant="primary" @click="confirm">Try again </b-button>
  </div>
</template>

<script setup lang="ts">
import axios, { AxiosError } from "axios";
import { BAlert, BButton } from "bootstrap-vue";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router/composables";

const route = useRoute();
const unsubscribing = ref(true);
const error = ref(true);
const errorMessage = ref("Something went wrong");

async function confirm() {
  error.value = false;
  unsubscribing.value = true;
  const subscriberRef = route.params.subscriberRef;
  try {
    await axios.delete(
      process.env.VUE_APP_PUBLIC_API_URL + "/v1/subscription/" + subscriberRef
    );
  } catch (e) {
    error.value = true;
    if (axios.isAxiosError(e) && (e as AxiosError).response?.status === 404)
      errorMessage.value = "No subscription found";
    else errorMessage.value = "Something went wrong";
  }

  unsubscribing.value = false;
}
onMounted(() => {
  confirm();
});
</script>

<style scoped></style>
