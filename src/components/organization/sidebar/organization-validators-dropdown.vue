<template>
  <div class="sb-nav-item">
    <nav-link
      class="sb-nav-dropdown-title"
      :title="'Validators'"
      v-on:click="toggleShow"
      :showDropdownToggle="true"
      :drop-down-showing="showing"
    />
    <div v-show="showing" class="sb-nav-dropdown">
      <nav-link
        v-for="validator in validators"
        :key="validator.publicKey"
        v-on:click="selectValidator(validator)"
        :title="validator.displayName"
        :is-link-in-dropdown="true"
        :has-danger="network.isNodeFailing(validator)"
        :dangers="network.getNodeFailingReason(validator).description"
        :has-warnings="network.nodeHasWarnings(validator)"
        :warnings="network.getNodeWarningReasons(validator)"
      >
        <template v-slot:action-dropdown>
          <node-actions :node="validator" />
        </template>
      </nav-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Node, Organization } from "@stellarbeat/js-stellar-domain";
import NavLink from "@/components/side-bar/nav-link.vue";
import NodeActions from "@/components/node/sidebar/node-actions.vue";
import { useDropdown } from "@/composables/useDropdown";
import useStore from "@/store/useStore";
import { computed, defineEmits } from "vue";
import { useRoute, useRouter } from "vue-router/composables";

const props = defineProps<{
  organization: Organization;
}>();

const emit = defineEmits(["toggleExpand"]);
const { showing, toggleShow } = useDropdown(true, emit);

const store = useStore();
const router = useRouter();
const route = useRoute();
const network = store.network;

const validators = computed(() => {
  return props.organization.validators.map((validator) =>
    network.getNodeByPublicKey(validator)
  );
});

function selectValidator(validator: Node) {
  router.push({
    name: "node-dashboard",
    params: { publicKey: validator.publicKey },
    query: {
      center: "1",
      "no-scroll": "0",
      view: route.query.view,
      network: route.query.network,
      at: route.query.at,
    },
  });
}
</script>

<style scoped></style>
