<template>
  <div class="sb-nav-item">
    <nav-link
      class="sb-nav-dropdown-title"
      :title="organization.name"
      v-on:click="toggleShow"
      :showDropdownToggle="true"
      :drop-down-showing="showing"
      :sub-title="'organization'"
      :show-sub-title="true"
    >
      <template v-slot:action-dropdown>
        <organization-actions :organization="organization" />
      </template>
    </nav-link>
    <div v-show="showing" class="sb-nav-dropdown">
      <nav-link
        v-for="validator in validators"
        :key="validator.publicKey"
        v-on:click="selectValidator(validator)"
        :title="getDisplayName(validator)"
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
import OrganizationActions from "@/components/organization/sidebar/organization-actions.vue";
import useStore from "@/store/useStore";
import { useDropdown } from "@/composables/useDropdown";
import { computed, defineEmits } from "vue";
import { useRoute, useRouter } from "vue-router/composables";

const props = defineProps<{
  organization: Organization;
}>();

const store = useStore();
const network = store.network;
const route = useRoute();
const router = useRouter();
const emit = defineEmits(["toggleExpand"]);
const { showing, toggleShow } = useDropdown(true, emit);
const validators = computed(() =>
  props.organization.validators.map((validator) =>
    network.getNodeByPublicKey(validator)
  )
);

function getDisplayName(validator: Node) {
  if (validator.name) return validator.name;

  return (
    validator.publicKey.substring(0, 7) +
    "..." +
    validator.publicKey.substring(50, 100)
  );
}

function selectValidator(validator: Node) {
  if (route.params.publicKey && route.params.publicKey === validator.publicKey)
    return;

  router.push({
    name: "node-dashboard",
    params: { publicKey: validator.publicKey },
    query: {
      center: "1",
      "no-scroll": "1",
      view: route.query.view,
      network: route.query.network,
      at: route.query.at,
    },
  });
}
</script>
