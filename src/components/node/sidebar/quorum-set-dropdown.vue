<template>
  <div class="sb-nav-item" :class="classObject">
    <nav-link
      :title="title"
      v-on:click="toggleShow"
      :showDropdownToggle="true"
      :showIcon="isRoot"
      :show-sub-title="true"
      :sub-title="
        quorumSet.hasValidators()
          ? 'with threshold ' + quorumSet.threshold
          : 'not yet detected'
      "
      :drop-down-showing="showing"
      :secondary="!isRoot"
      :has-warnings="hasWarnings"
      :warnings="quorumSetWarnings"
      :has-danger="hasDangers"
      :dangers="quorumSetDangers"
    >
      <template v-slot:action-dropdown>
        <quorum-set-actions
          :level="level"
          :quorum-set="quorumSet"
          :parentQuorumSet="parentQuorumSet"
          v-on:expand="showing = true"
        />
      </template>
    </nav-link>
    <div v-show="showing" class="sb-nav-dropdown">
      <nav-link
        v-for="validator in validators"
        :key="validator.publicKey"
        v-on:click="selectNode(validator)"
        :title="getDisplayName(validator)"
        :isLinkInDropdown="true"
        :has-danger="store.network.isNodeFailing(validator)"
        :dangers="
          'Node not validating ' +
          (store.network.isQuorumSetBlocked(validator)
            ? ': quorum-set not reaching threshold'
            : '')
        "
        :has-warnings="
          NodeWarningDetector.nodeHasWarning(validator, store.network)
        "
        :warnings="
          NodeWarningDetector.getNodeWarningReasonsConcatenated(
            validator,
            store.network,
          )
        "
      >
        <template v-slot:action-dropdown>
          <node-actions
            :node="validator"
            :supports-delete="true"
            :quorumSet="quorumSet"
          />
        </template>
      </nav-link>
      <quorum-set-dropdown
        :parentQuorumSet="quorumSet"
        v-for="(innerQuorumSet, index) in innerQuorumSets"
        :quorumSet="innerQuorumSet"
        :level="level + 1"
        :key="index"
        :expand="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Node,
  QuorumSet,
  QuorumSetService,
} from "@stellarbeat/js-stellarbeat-shared";
import NavLink from "@/components/side-bar/nav-link.vue";
import NodeActions from "@/components/node/sidebar/node-actions.vue";
import QuorumSetActions from "@/components/node/sidebar/quorum-set-actions.vue";
import useStore from "@/store/useStore";
import { computed, toRefs, withDefaults } from "vue";
import { useRoute, useRouter } from "vue-router/composables";
import { useDropdown } from "@/composables/useDropdown";
import { NodeWarningDetector } from "@/services/NodeWarningDetector";
import { QuorumSetWarningDetector } from "@/services/QuorumSetWarningDetector";
import { QuorumSetDangerDetector } from "@/services/QuorumSetDangerDetector";

export interface Props {
  quorumSet: QuorumSet;
  parentQuorumSet?: QuorumSet;
  level?: number;
  expand: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  expand: false,
});

const { quorumSet, parentQuorumSet, level, expand } = toRefs(props);

const store = useStore();
const router = useRouter();
const route = useRoute();
const emit = defineEmits(["toggleExpand"]);
const { showing, toggleShow } = useDropdown(expand.value, emit);

const quorumSetDangers = computed(() => {
  if (!store.selectedNode) throw new Error("No node selected");
  return QuorumSetDangerDetector.getQuorumSetDangers(
    store.selectedNode,
    props.quorumSet,
    store.network,
  );
});

const quorumSetWarnings = computed(() => {
  return QuorumSetWarningDetector.getQuorumSetWarnings(
    props.quorumSet,
    store.network,
  );
});

const hasDangers = computed(() => {
  if (!store.selectedNode) throw new Error("No node selected");
  return QuorumSetDangerDetector.quorumSetHasDangers(
    store.selectedNode,
    props.quorumSet,
    store.network,
  );
});

const hasWarnings = computed(() => {
  return QuorumSetWarningDetector.quorumSetHasWarnings(
    props.quorumSet,
    store.network,
  );
});

const classObject = computed(() => {
  return {
    "pl-3": props.level === 1,
    "pl-4": props.level === 2,
  };
});

const title = computed(() => {
  if (isOrganizationSubQuorum(props.quorumSet))
    return subQuorumOrganizationName(props.quorumSet);
  else return "Quorum set";
});

const isRoot = computed(() => {
  return props.level === 0;
});

const validators = computed(() => {
  return props.quorumSet.validators.map((validator) =>
    store.network.getNodeByPublicKey(validator),
  );
});

const innerQuorumSets = computed(() => {
  return props.quorumSet.innerQuorumSets;
});

function selectNode(node: Node) {
  if (route.params.publicKey && route.params.publicKey === node.publicKey)
    return;

  router.push({
    name: "node-dashboard",
    params: { publicKey: node.publicKey },
    query: {
      center: "1",
      "no-scroll": "0",
      view: route.query.view,
      network: route.query.network,
      at: route.query.at,
    },
  });
}

function getDisplayName(node: Node) {
  if (node.name) return node.name;

  return (
    node.publicKey.substring(0, 7) + "..." + node.publicKey.substring(50, 100)
  );
}

function isOrganizationSubQuorum(quorumSet: QuorumSet): boolean {
  if (isRoot.value) return false;

  return QuorumSetService.isOrganizationQuorumSet(quorumSet, store.network);
}

function subQuorumOrganizationName(quorumSet: QuorumSet): string {
  if (!isOrganizationSubQuorum) {
    return "";
  }
  const organizationId = store.network.getNodeByPublicKey(
    quorumSet.validators[0],
  ).organizationId as string;

  return store.network.getOrganizationById(organizationId).name;
}
</script>
