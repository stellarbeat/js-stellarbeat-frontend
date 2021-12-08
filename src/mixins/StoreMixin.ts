import Vue from "vue";
import { Component } from "vue-property-decorator";
import { Network } from "@stellarbeat/js-stellar-domain";
import Store from "../store/Store";
import useStore from "@/useStore";

@Component({})
export class StoreMixin extends Vue {
  get store(): Store {
    return useStore();
  }

  get network(): Network {
    return this.store.network;
  }
}
