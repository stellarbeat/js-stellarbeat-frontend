<template>
  <div>
    <div v-if="!error">
      <div v-if="unmuting">
        <h4>Unmuting event</h4>
        <div>
          <div class="loader"></div>
        </div>
      </div>
      <div v-else>
        <b-alert variant="success" show>Event unmuted!</b-alert>
      </div>
    </div>
    <div v-else>
      <h4>{{ errorMessage }}</h4>
      <button class="btn btn-primary" @click="unmute">Try again</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BAlert } from "bootstrap-vue";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router/composables";

const route = useRoute();
const unmuting = ref(true);
const error = ref(true);
const errorMessage = ref("Something went wrong");

async function unmute() {
  error.value = false;
  unmuting.value = true;
  const subscriberRef = route.params.subscriberRef;
  const eventSourceId = route.query["event-source-id"];
  if (!eventSourceId) {
    error.value = true;
    errorMessage.value = "event-source-id query param missing";
    return;
  }
  const eventType = route.query["event-type"];
  if (!eventType) {
    error.value = true;
    errorMessage.value = "event-type query param missing";
    return;
  }
  const eventSourceType = route.query["event-source-type"];
  if (!eventSourceType) {
    error.value = true;
    errorMessage.value = "event-source-type query param missing";
    return;
  }
  try {
    const response = await fetch(
      import.meta.env.VUE_APP_PUBLIC_API_URL +
        "/v1/subscription/" +
        subscriberRef +
        "/unmute",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventSourceId: eventSourceId,
          eventType: eventType,
          eventSourceType: eventSourceType,
        }),
      },
    );
    if (!response.ok) {
      error.value = true;
      errorMessage.value = "Failed to unmute event";
    }
  } catch (e) {
    error.value = true;
    errorMessage.value = "Something went wrong";
  }

  unmuting.value = false;
}

onMounted(() => {
  unmute();
});
</script>

<style scoped></style>
