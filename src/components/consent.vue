<template>
  <b-modal
    id="modal-1"
    title="Welcome to Stellarbeat!"
    no-close-on-backdrop
    no-close-on-esc
    ref="consentModal"
    hide-header-close
    ok-title="I Agree"
    cancel-title="Decline"
    @ok="onAccept"
    @cancel="onDecline"
  >
    <p>
      By clicking "I Agree", you acknowledge that you have read, understood, and
      agree to be bound by the
      <router-link
        :to="{
          name: 'terms-and-conditions',
          query: {
            view: $route.query.view,
            network: $route.query.network,
            at: $route.query.at,
          },
        }"
        exact
        >Terms and Conditions</router-link
      >
      and our
      <router-link
        :to="{
          name: 'privacy',
          query: {
            view: $route.query.view,
            network: $route.query.network,
            at: $route.query.at,
          },
        }"
        exact
        >Privacy Policy</router-link
      >. If you do not agree to these terms, please do not use this service.
    </p></b-modal
  >
</template>
<script setup lang="ts">
import useStore from "@/store/useStore";
import { BModal } from "bootstrap-vue";
import useUserConsentManager from "@/store/useUserConsentManager";
import { onMounted, ref, Ref } from "vue";
const store = useStore();
const userConsentManager = useUserConsentManager();
const consentModal: Ref<BModal | null> = ref(null);

const onAccept = () => {
  userConsentManager.giveConsent(store.latestTermsChangeTimestamp);
  consentModal.value?.hide();
};

const onDecline = () => {
  window.location.href = "https://dashboard.stellar.org";
};
onMounted(() => {
  if (
    !userConsentManager.userHasGivenConsent(store.latestTermsChangeTimestamp)
  ) {
    consentModal.value?.show();
  }
});
</script>
<style scoped></style>
