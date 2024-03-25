<template>
  <div v-if="!error">
    <div v-if="confirming">
      <h4>Confirming subscription</h4>
      <div>
        <div class="loader"></div>
      </div>
    </div>
    <div v-else-if="!alreadyConfirmed">
      <b-alert variant="success" show>Subscription confirmed!</b-alert>
    </div>
    <div v-else>
      <b-alert variant="warning" show>Stale confirmation link</b-alert>
    </div>
  </div>
  <div v-else>
    <h4>Something went wrong...</h4>
    <b-button variant="primary" @click="confirm">Try again </b-button>
  </div>
</template>

<script setup lang="ts">
import { BAlert, BButton } from "bootstrap-vue";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router/composables";

const route = useRoute();
const confirming = ref(true);
const alreadyConfirmed = ref(false);
const error = ref(true);

async function confirm() {
  error.value = false;
  alreadyConfirmed.value = false;
  confirming.value = true;
  const pendingSubscriptionId = route.params.pendingSubscriptionId;
  try {
    const response = await fetch(
      import.meta.env.VUE_APP_PUBLIC_API_URL +
        "/v1/subscription/" +
        pendingSubscriptionId +
        "/confirm",
      {
        method: "POST",
      },
    );
    if (!response.ok) {
      error.value = true;
    }
  } catch (e) {
    if (e instanceof Error && e.message === "404") {
      alreadyConfirmed.value = true;
    } else {
      error.value = true;
    }
  }

  confirming.value = false;
}
onMounted(() => {
  confirm();
});
</script>
