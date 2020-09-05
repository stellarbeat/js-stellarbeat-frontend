import Vue from 'vue';
import {Mixins, Component, Prop, Watch} from 'vue-property-decorator';
import {Network} from '@stellarbeat/js-stellar-domain';
import Store from '../store/Store';

@Component({})
export class StoreMixin extends Vue {
    protected isLoading: boolean = true;

    get store(): Store {
        return this.$root.$data.store;
    }

    get network(): Network {
        return this.store.network;
    }


}