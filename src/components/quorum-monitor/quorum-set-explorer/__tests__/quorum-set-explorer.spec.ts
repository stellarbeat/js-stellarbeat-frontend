import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import {shallowMount} from '@vue/test-utils';
import QuorumSetExplorer from './../quorum-set-explorer.vue';
import {Network, Node} from '@stellarbeat/js-stellar-domain';
import VueTruncate from 'vue-truncate-filter';

Vue.use(VueTruncate);
Vue.use(BootstrapVue);

describe('quorum-set-explorer', () => {
    let selectedNode: Node = new Node('54.204.238.171');
    selectedNode.publicKey = 'GABMKJM6I25XI4K7U6XWMULOUQIQ27BCTMLS6BYYSOWKTBUXVRJSXHYQ';
    selectedNode.name = 'SDF validator 3';

    let node2: Node = new Node('54.242.115.128');
    node2.publicKey = 'GCGB2S2KGYARPVIA37HYZXVRM2YZUEXA6S33ZU5BUDC6THSB62LZSTYH';
    node2.name = 'SDF validator 1';

    let network: Network = new Network([selectedNode, node2]);

    const wrapper = shallowMount(QuorumSetExplorer, {
        propsData: {
            network: network,
            selectedNode: selectedNode
        }
    });

    it('renders the selected node', () => {
        expect(wrapper.findAll('.node-details-title').at(0).text())
            .toEqual('Selected node: ' + selectedNode.displayName);
    });

    it('shows an info modal when clicked on a validator info button', () => {
        wrapper.findAll('.node-info-btn').at(0).trigger('click');
        expect(wrapper.findAll('#node-details-modal').at(0).isVisible())
            .toEqual(true);
    });

    it('has three rows', () => {
        expect(wrapper.findAll('.row').length)
            .toEqual(2);
    } )
});