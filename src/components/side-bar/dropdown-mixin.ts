import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import { Network } from "@stellarbeat/js-stellar-domain";
import Store from "../../store/Store";

@Component({})
export class DropdownMixin extends Vue {
  @Prop({ default: false })
  expand!: boolean;

  protected currentPage = 1;
  protected perPage = 10;
  protected showing!: boolean;

  get store(): Store {
    return this.$root.$data.store;
  }

  get network(): Network {
    return this.store.network;
  }

  paginate(items: any[]) {
    return items.slice(
      (this.currentPage - 1) * this.perPage,
      this.currentPage * this.perPage
    );
  }

  toggleShow(): void {
    this.showing = !this.showing;
    this.$emit("toggleExpand");
  }

  created() {
    this.showing = this.expand;
  }
}
