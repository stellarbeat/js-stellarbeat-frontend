<template>
  <div class="card card-profile">
    <div
      class="card-body pb-2 d-flex flex-column text-center justify-content-center align-items-center"
    >
      <h3 class="my-1">
        <span
          v-if="organization.isTierOneOrganization"
          v-tooltip="'Tier one organization'"
          class="badge sb-badge badge-primary"
        >
          <b-icon-shield />
        </span>
        {{ organization.name }}
        <b-badge
          v-if="store.getOrganizationFailAt(organization) <= 0"
          v-tooltip="'More then 50% of its validators are failing'"
          variant="danger"
          >Failing
        </b-badge>
      </h3>
      <p v-if="organization.description" class="m-2">
        {{ organization.description }}
      </p>
      <b-alert v-else class="mt-2" show variant="info"
        >No description found in
        <a
          target="_blank"
          rel="noopener"
          href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md"
          >stellar.toml</a
        >
      </b-alert>

      <ul class="social-links list-inline mb-2 mt-2">
        <li v-if="organization.url" class="list-inline-item">
          <a
            v-tooltip="organization.url"
            :href="organization.url"
            :title="organization.url"
            class="social-link"
            target="_blank"
            rel="noopener"
          >
            <b-icon-link scale="1.4" />
          </a>
        </li>
        <li v-if="organization.physicalAddress" class="list-inline-item">
          <a
            v-tooltip="organization.physicalAddress"
            :href="
              'https://www.google.com/maps/search/?api=1&query=' +
              organization.physicalAddress
            "
            target="_blank"
            rel="noopener"
            class="social-link"
            :title="organization.physicalAddress"
          >
            <b-icon-map scale="1.2" />
          </a>
        </li>
        <li v-if="organization.officialEmail" class="list-inline-item">
          <a
            v-tooltip="organization.officialEmail"
            class="social-link"
            :title="organization.officialEmail"
            :href="'mailto:' + organization.officialEmail"
            target="_blank"
            rel="noopener"
          >
            <b-icon-envelope scale="1.2" />
          </a>
        </li>
        <li v-if="organization.phoneNumber" class="list-inline-item">
          <a
            v-tooltip="organization.phoneNumber"
            class="social-link"
            :title="organization.phoneNumber"
            :href="'tel:' + organization.phoneNumber"
            target="_blank"
            rel="noopener"
          >
            <b-icon-phone scale="1.2" />
          </a>
        </li>
        <li v-if="organization.twitter" class="list-inline-item">
          <a
            v-tooltip="organization.twitter"
            :href="'https://twitter.com/' + organization.twitter"
            class="social-link"
            title="Twitter"
            target="_blank"
            rel="noopener"
          >
            <twitter />
          </a>
        </li>
        <li v-if="organization.github" class="list-inline-item">
          <a
            v-tooltip="organization.github"
            :href="'https://github.com/' + organization.github"
            target="_blank"
            rel="noopener"
            title="Github"
            class="social-link"
          >
            <github />
          </a>
        </li>
        <li v-if="organization.keybase" class="list-inline-item">
          <a
            v-tooltip="organization.keybase"
            :href="'https://keybase.io/' + organization.keybase"
            rel="noopener"
            title="Keybase"
            target="_blank"
            class="social-link"
          >
            <img
              class="mb-2"
              width="19px"
              src="../../../assets/keybase-brands-grey.svg"
              alt="keybase"
            />
          </a>
        </li>
        <li v-if="organization.horizonUrl" class="list-inline-item">
          <a
            v-tooltip="organization.horizonUrl"
            :href="organization.horizonUrl"
            title="Horizon"
            target="_blank"
            class="social-link"
            rel="noopener"
          >
            <stellar />
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Organization } from "@stellarbeat/js-stellarbeat-shared";
import Github from "@/components/organization/logo/github.vue";
import Twitter from "@/components/organization/logo/twitter.vue";
import {
  BAlert,
  BBadge,
  BIconEnvelope,
  BIconLink,
  BIconMap,
  BIconPhone,
  BIconShield,
} from "bootstrap-vue";
import Stellar from "@/components/organization/logo/stellar.vue";
import useStore from "@/store/useStore";

defineProps<{
  organization: Organization;
}>();

const store = useStore();
</script>

<style scoped>
.social-link {
  text-decoration: none;
}

hr {
  margin: 0 0 4px;
}
</style>
