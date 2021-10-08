import Vue from "vue";
import { Prop } from "vue-property-decorator";
import Component from "vue-class-component";
import { Network } from "@stellarbeat/js-stellar-domain";
import Store from "../../store/Store";

@Component({})
export class DropdownMixin extends Vue {
  @Prop({ default: false })
  expand!: boolean;

  protected currentPage = 1;
  protected perPage = 10;
  protected showing = false;

  get store(): Store {
    return this.$root.$data.store;
  }

  get network(): Network {
    return this.store.network;
  }

  paginate<T>(items: T[]): T[] {
    return items.slice(
      (this.currentPage - 1) * this.perPage,
      this.currentPage * this.perPage
    );
  }

  toggleShow(): void {
    this.showing = !this.showing;
    this.$emit("toggleExpand");
  }

  mounted() {
    this.showing = this.expand;
  }
}
