<template>
  <div>
    <div v-if="requesting">
      <h4>Requesting subscription</h4>
      <div>
        <div class="loader"></div>
      </div>
    </div>
    <div v-else>
      <h4>Subscribe to</h4>
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
          description="Triggered when inactive, not validating or history archive not up-to-date for three consecutive updates or when history archive verification error is detected"
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
          description="Triggered when organization unavailable for three consecutive updates"
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
          description="Triggered when transitive quorumSet changes, when liveness or danger risks drop below
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
          >Create or update subscriptions</b-button
        >
        <b-button type="reset" variant="default">Clear form</b-button>
      </b-form>
    </div>
    <b-alert class="mt-5" variant="info" :show="true"
      ><ul>
        <li>
          Events are triggered when they first occur. For example a node that is
          down for three days, will only trigger one event at the start.
        </li>
        <li>
          To prevent notification overload, notifications for a specific event
          are muted (not sent) for 24H after they are first sent. You can
          however unmute event notifications by following the link in the
          notification email. For example if you resolve a reported issue with
          your node, and wish to be notified immediately when the issue should
          reappear.
        </li>
        <li>
          This service is provided best effort. If network issues are reported,
          be sure to check the
          <a href="https://dashboard.stellar.org" target="_blank"
            >official Stellar network dashboard</a
          >. There could be an issue with the Stellarbeat crawler, which itself
          is in essence a Watcher node.
        </li>
        <li>
          To improve the chances of the Stellarbeat crawler connecting to your
          node, add the crawler public keys to your PREFERRED_PEER_KEYS in your
          <a
            href="https://github.com/stellar/stellar-core/blob/ecd0a7462c84bd1d2445cdfd48aa9b38b1bbfd20/docs/stellar-core_example.cfg#L170"
            target="_blank"
            >Stellar core configuration file. </a
          >: GCMFBFXLCVWMYZL64U75DTRT6YNPFTG5ZV5P2PL2GTI3GNMEV4WC53JC and
          GAK7ZMDHKKEOYGZH3OSZQERK6UG5UDG5WEJV7GTN3Z4OIFXS3DXPUCRY
        </li>
        <li>
          The Stellarbeat notification service does not replace the monitoring
          setup advised in the
          <a
            href="https://developers.stellar.org/docs/run-core-node/monitoring/"
            >Stellar monitoring docs</a
          >.
        </li>
      </ul>
    </b-alert>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import { Multiselect } from "vue-multiselect";
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
    Multiselect,
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
