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
      <b-alert variant="warning" show
        >Cannot find a pending subscription, did you already confirm?</b-alert
      >
    </div>
  </div>
  <div v-else>
    <h4>Something went wrong...</h4>
    <b-button variant="primary" @click="confirm">Try again </b-button>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import { StoreMixin } from "@/mixins/StoreMixin";
import axios, { AxiosError } from "axios";
import { BAlert, BButton } from "bootstrap-vue";

@Component({ components: { BAlert, BButton } })
export default class Confirm extends Mixins(StoreMixin) {
  private confirming = true;
  private alreadyConfirmed = false;
  private error = true;

  async confirm() {
    this.error = false;
    this.alreadyConfirmed = false;
    this.confirming = true;
    const pendingSubscriptionId = this.$route.params.pendingSubscriptionId;
    try {
      await axios.post(
        process.env.VUE_APP_PUBLIC_API_URL +
          "/v1/subscription/" +
          pendingSubscriptionId +
          "/confirm"
      );
    } catch (e) {
      if (axios.isAxiosError(e) && (e as AxiosError).response?.status === 404)
        this.alreadyConfirmed = true;
      else this.error = true;
    }

    this.confirming = false;
  }
  mounted() {
    this.confirm();
  }
}
</script>

<style scoped></style>
