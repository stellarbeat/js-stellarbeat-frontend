import Vue from 'vue';
import {Mixins, Component, Prop, Watch} from 'vue-property-decorator';
import {Network} from '@stellarbeat/js-stellar-domain';
import Store from '../store/Store';

@Component({})
export class IsLoadingMixin extends Vue {
    protected isLoading: boolean = true;

    get dimmerClass() {
        return {
            dimmer: true,
            active: this.isLoading,
        };
    }

}