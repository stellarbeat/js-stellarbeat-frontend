<template>
  <portal to="quorum-set-modals">
    <div
      :id="'add-organization-modal-' + id"
      :ref="(el) => (modalRefs[id] = el)"
      class="modal fade"
      tabindex="-1"
      role="dialog"
      aria-labelledby="addOrganizationModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="addOrganizationModalLabel" class="modal-title">
              Select organization to add
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <AddOrganizationsTable
              v-if="visible"
              :organizations="possibleOrganizationsToAdd"
              @organizations-selected="onOrganizationsSelected"
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-dismiss="modal"
            >
              Close
            </button>
            <button
              type="button"
              class="btn btn-primary"
              data-dismiss="modal"
              @click="organizationsToAddModalOk"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  </portal>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, PropType, Ref, ref, toRefs } from "vue";
import useStore from "@/store/useStore";
import { Organization, QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import AddOrganizationsTable from "@/components/node/tools/simulation/add-organizations-table.vue";

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  quorumSet: {
    type: Object as PropType<QuorumSet>,
    required: true,
  },
});
const modalRefs = ref({} as { [key: string]: Ref<HTMLDivElement> });
const { id, quorumSet } = toRefs(props);
const visible = ref(false);

const organizationsToAdd = ref<Organization[]>([]);
const store = useStore();
const network = store.network;

const possibleOrganizationsToAdd = computed(() => {
  const trustedOrganizations = network
    .getTrustedOrganizations(quorumSet.value)
    .map((org) => org.id);

  return store.network.organizations.filter(
    (organization) => trustedOrganizations.indexOf(organization.id) < 0,
  );
});

function organizationsToAddModalOk() {
  if (organizationsToAdd.value.length > 0) {
    addOrganizationsToQuorumSet(quorumSet.value, organizationsToAdd.value);
  }
}
function onOrganizationsSelected(organizations: Organization[]) {
  organizationsToAdd.value = organizations;
}

function addOrganizationsToQuorumSet(
  toQuorumSet: QuorumSet,
  organizations: Organization[],
) {
  store.addOrganizations(toQuorumSet, organizations);
}

onMounted(() => {
  nextTick(() => {
    const myModalRef = modalRefs.value[id.value];
    if (myModalRef === undefined) return;

    $(myModalRef).on("show.bs.modal", () => {
      visible.value = true;
    });
  });
});
</script>
