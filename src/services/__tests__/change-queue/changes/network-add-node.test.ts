import {Node, Network} from '@stellarbeat/js-stellar-domain';
import {NetworkAddNode} from '@/services/change-queue/changes/network-add-node';

describe("network add node", () => {

    test('network add node', () => {
        let node = new Node('a');
        let newNode = new Node('b');
        let network = new Network([node]);

        let change = new NetworkAddNode(network, newNode);
        change.execute();
        expect(network.nodes).toEqual([node, newNode]);
        change.revert();
        expect(network.nodes).toEqual([node]);
    });
});
