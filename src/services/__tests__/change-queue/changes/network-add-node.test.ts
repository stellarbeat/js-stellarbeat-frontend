import { Node, Network } from "@stellarbeat/js-stellar-domain";
import { NetworkAddNode } from "@/services/change-queue/changes/network-add-node";

describe("network add node", () => {
  test("network add node", () => {
    const node = new Node("a");
    const newNode = new Node("b");
    const network = new Network([node]);

    const change = new NetworkAddNode(network, newNode);
    change.execute();
    expect(network.nodes).toEqual([node, newNode]);
    change.revert();
    expect(network.nodes).toEqual([node]);
  });
});
