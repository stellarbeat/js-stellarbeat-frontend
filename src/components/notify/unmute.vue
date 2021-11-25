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
      <b-button variant="primary" @click="unmute">Try again </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import { StoreMixin } from "@/mixins/StoreMixin";
import axios from "axios";
import { BAlert, BButton } from "bootstrap-vue";

@Component({ components: { BAlert, BButton } })
export default class Confirm extends Mixins(StoreMixin) {
  private unmuting = true;
  private error = true;
  private errorMessage = "Something went wrong";

  async unmute() {
    this.error = false;
    this.unmuting = true;
    const subscriberRef = this.$route.params.subscriberRef;
    const eventSourceId = this.$route.query["event-source-id"];
    if (!eventSourceId) {
      this.error = true;
      this.errorMessage = "event-source-id query param missing";
      return;
    }
    const eventType = this.$route.query["event-type"];
    if (!eventType) {
      this.error = true;
      this.errorMessage = "event-type query param missing";
      return;
    }
    const eventSourceType = this.$route.query["event-source-type"];
    if (!eventSourceType) {
      this.error = true;
      this.errorMessage = "event-source-type query param missing";
      return;
    }
    try {
      await axios.post(
        process.env.VUE_APP_PUBLIC_API_URL +
          "/v1/subscription/" +
          subscriberRef +
          "/unmute",
        {
          eventSourceId: eventSourceId,
          eventType: eventType,
          eventSourceType: eventSourceType,
        }
      );
    } catch (e) {
      if (axios.isAxiosError(e)) console.log(e.response);
      this.error = true;
      this.errorMessage = "Something went wrong";
    }

    this.unmuting = false;
  }
  mounted() {
    this.unmute();
  }
}
</script>

<style scoped></style>
