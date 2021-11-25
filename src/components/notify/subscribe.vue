<template>
  <div>
    <div v-if="requesting">
      <h4>Requesting subscription</h4>
      <div>
        <div class="loader"></div>
      </div>
    </div>
    <div v-else>
      <h4>Notify me about</h4>
      <b-form @submit="onSubmit" @reset="onReset">
        <b-alert variant="success" :show="requested"
          >Subscription request received, you will receive an email
          shortly.</b-alert
        >
        <b-alert variant="danger" :show="subscribeError"
          >Something went wrong, please try again later or contact
          support.</b-alert
        >
        <b-form-group
          id="nodes-group"
          label="Node events"
          label-for="nodes-select"
          description="Validating status, history archives up-to-date,..."
        >
          <multiselect
            id="nodes-select"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            placeholder="Nodes"
            label="name"
            track-by="name"
            v-model="selectedNodes"
            :options="nodes"
            :internal-search="false"
            @search-change="searchNodes"
          >
          </multiselect>
        </b-form-group>

        <b-form-group
          id="organizations-group"
          label="Organization events"
          label-for="organization-select"
          description="Organization availability"
        >
          <multiselect
            id="organization-select"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            placeholder="Organizations"
            label="name"
            track-by="name"
            v-model="selectedOrganizations"
            :options="organizations"
          >
          </multiselect>
        </b-form-group>
        <b-form-group
          id="network-group"
          description="Important network topology changes, liveness or danger risks below
            thresholds."
        >
          <b-form-checkbox
            id="network-checkbox"
            v-model="networkSubscription"
            name="network-checkbox"
            value="requested"
            unchecked-value="not_subscribed"
          >
            Network events
          </b-form-checkbox>
        </b-form-group>
        <b-form-group id="email-group" class="mt-6">
          <b-form-input
            id="email-address"
            v-model="emailAddress"
            :state="emailAddressState"
            placeholder="Enter your email address"
            required
            trim
          ></b-form-input>
        </b-form-group>
        <b-button
          type="submit"
          variant="primary"
          :disabled="!(emailAddressState === true)"
          >Create or update subscription</b-button
        >
        <b-button type="reset" variant="default">Clear form</b-button>
      </b-form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import { StoreMixin } from "@/mixins/StoreMixin";
import axios from "axios";
import {
  BButton,
  BFormInput,
  BFormCheckbox,
  BFormInvalidFeedback,
  BFormText,
  BForm,
  BFormGroup,
  BAlert,
} from "bootstrap-vue";

type EventSourceId = {
  type: string;
  id: string;
};

type SelectNode = {
  name: string;
  publicKey: string;
};

type SelectedOrganization = {
  name: string;
  id: string;
};

@Component({
  components: {
    BFormCheckbox,
    BAlert,
    BFormGroup,
    BForm,
    BButton,
    BFormInput,
    BFormInvalidFeedback,
    BFormText,
  },
})
export default class NotifySubscribe extends Mixins(StoreMixin) {
  protected emailAddress = "";
  protected requested = false;
  protected requesting = false;
  protected subscribeError = false;
  protected networkSubscription = false;
  protected selectedNodes: SelectNode[] | null = null;
  protected nodes: SelectNode[] = [];
  protected selectedOrganizations: SelectedOrganization[] | null = null;

  get organizations(): SelectedOrganization[] {
    return this.network.organizations.map((org) => {
      return {
        name: org.name,
        id: org.id,
      };
    });
  }
  searchNodes(query: string) {
    this.nodes = this.network.nodes
      .filter(
        (node) =>
          node.publicKey.toLowerCase().search(query.toLowerCase()) !== -1 ||
          node.displayName.toLowerCase().search(query.toLowerCase()) !== -1
      )
      .map((node) => {
        return { name: node.displayName, publicKey: node.publicKey };
      });
  }

  get emailAddressState() {
    if (this.emailAddress === "") return null;
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(this.emailAddress.toLowerCase());
  }

  onReset(event: Event) {
    event.preventDefault();
    this.resetForm();
  }

  resetForm() {
    this.emailAddress = "";
    this.selectedOrganizations = null;
    this.selectedNodes = null;
    this.networkSubscription = false;
  }

  getSelectedEventSourceIds(): EventSourceId[] {
    const eventSourceIds: EventSourceId[] = [];
    if (this.networkSubscription) {
      eventSourceIds.push({
        type: "network",
        id: this.store.network.id
          ? this.store.network.id
          : "Public Global Stellar Network ; September 2015",
      });
    }

    if (this.selectedNodes !== null) {
      this.selectedNodes.forEach((node: SelectNode) => {
        eventSourceIds.push({
          type: "node",
          id: node.publicKey,
        });
      });
    }

    if (this.selectedOrganizations !== null) {
      this.selectedOrganizations.forEach((org: SelectedOrganization) => {
        eventSourceIds.push({
          type: "organization",
          id: org.id,
        });
      });
    }

    return eventSourceIds;
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.subscribeError = false;
    this.requested = false;
    if (this.emailAddressState !== true) return;
    try {
      this.requesting = true;
      await axios.post(
        process.env.VUE_APP_PUBLIC_API_URL + "/v1/subscription",
        {
          emailAddress: this.emailAddress,
          eventSourceIds: this.getSelectedEventSourceIds(),
        }
      );
      this.requested = true;
      this.requesting = false;
      this.resetForm();
    } catch (e) {
      this.requesting = false;
      this.subscribeError = true;
      console.log(e);
    }
  }

  mounted() {
    this.nodes = this.network.nodes.map((node) => {
      return {
        name: node.displayName,
        publicKey: node.publicKey,
      };
    });
  }
}
</script>

<style scoped></style>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
