import { type NetworkRepository } from "@/repositories/NetworkRepository";
import { Network, Node, QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import { ok, Result } from "neverthrow";

export class MeridianRepository implements NetworkRepository {
  find(): Promise<Result<Network, Error>> {
    const organizations = [];
    const nodes = [
      {
        ip: "localhost",
        port: 11625,
        publicKey: "A",
        name: "A",
        quorumSet: new QuorumSet(3, ["A", "B", "C"]),
      },
      {
        ip: "localhost",
        port: 11626,
        publicKey: "B",
        name: "B",
        quorumSet: new QuorumSet(3, ["A", "B", "D"]),
      },
      {
        ip: "localhost",
        port: 11627,
        publicKey: "C",
        name: "C",
        quorumSet: new QuorumSet(3, ["A", "C", "D"]),
      },
      {
        ip: "localhost",
        port: 11628,
        publicKey: "D",
        name: "D",
        quorumSet: new QuorumSet(3, ["B", "C", "D"]),
      },
      {
        ip: "localhost",
        port: 11629,
        publicKey: "E",
        name: "E",
        quorumSet: new QuorumSet(3, ["D", "E", "F"]),
      },
      {
        ip: "localhost",
        port: 11630,
        publicKey: "F",
        name: "F",
        quorumSet: new QuorumSet(3, ["G", "E", "F"]),
      },
      {
        ip: "localhost",
        port: 11631,
        publicKey: "G",
        name: "G",
        quorumSet: new QuorumSet(3, ["D", "F", "G"]),
      },
    ].map((node) => {
      const myNode = new Node(node.publicKey, node.ip, node.port);
      myNode.name = node.name;
      myNode.active = true;
      myNode.overLoaded = false;
      myNode.quorumSet = node.quorumSet;
      myNode.isValidating = true;

      return myNode;
    });

    const network = new Network(nodes, organizations);
    network.networkStatistics.hasQuorumIntersection = true;
    network.networkStatistics.minBlockingSetCountryFilteredSize = 1;
    network.networkStatistics.minBlockingSetCountrySize = 1;
    network.networkStatistics.minBlockingSetFilteredSize = 1;
    network.networkStatistics.minBlockingSetOrgsFilteredSize = 1;
    network.networkStatistics.minBlockingSetISPFilteredSize = 1;
    network.networkStatistics.minSplittingSetSize = 2;
    network.networkStatistics.minSplittingSetOrgsSize = 2;
    network.networkStatistics.minSplittingSetCountrySize = 1;
    network.networkStatistics.minSplittingSetISPSize = 1;
    network.networkStatistics.topTierSize = 4;
    network.networkStatistics.topTierOrgsSize = 4;

    return Promise.resolve(ok(network));
  }
}
