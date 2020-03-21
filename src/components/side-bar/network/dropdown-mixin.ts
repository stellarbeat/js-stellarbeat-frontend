import Vue from 'vue';
import {Mixins, Component, Prop} from 'vue-property-decorator';
import {Network} from '@stellarbeat/js-stellar-domain';
import Store from '../../../store/Store';

@Component({})
export class DropdownMixin extends Vue {
    @Prop({default: false})
    expand!: boolean;

    protected currentPage: number = 1;
    protected perPage: number = 10;
    protected showing: boolean = this.expand;

    get store(): Store {
        return this.$root.$data.store;
    }

    get network(): Network {
        return this.store.network;
    }

    paginate(items:any[]) {
        return items.slice(
            (this.currentPage - 1) * this.perPage, this.currentPage * this.perPage
        );
    }

    toggleShow(): void {
        this.showing = !this.showing;
    }
}