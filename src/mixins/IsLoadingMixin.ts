import Vue from "vue";
import { Component } from "vue-property-decorator";

@Component({})
export class IsLoadingMixin extends Vue {
  protected isLoading = true;

  get dimmerClass() {
    return {
      dimmer: true,
      active: this.isLoading,
    };
  }
}
