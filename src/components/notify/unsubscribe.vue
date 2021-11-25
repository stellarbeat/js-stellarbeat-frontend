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

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import { StoreMixin } from "@/mixins/StoreMixin";
import axios, { AxiosError } from "axios";
import { BAlert, BButton } from "bootstrap-vue";

@Component({ components: { BAlert, BButton } })
export default class Unsubscribe extends Mixins(StoreMixin) {
  private unsubscribing = true;
  private error = true;
  private errorMessage = "Something went wrong";

  async confirm() {
    this.error = false;
    this.unsubscribing = true;
    const subscriberRef = this.$route.params.subscriberRef;
    try {
      await axios.delete(
        process.env.VUE_APP_PUBLIC_API_URL + "/v1/subscription/" + subscriberRef
      );
    } catch (e) {
      this.error = true;
      if (axios.isAxiosError(e) && (e as AxiosError).response?.status === 404)
        this.errorMessage = "No subscription found";
      else this.errorMessage = "Something went wrong";
    }

    this.unsubscribing = false;
  }
  mounted() {
    this.confirm();
  }
}
</script>

<style scoped></style>
