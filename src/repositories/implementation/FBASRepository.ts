import { type NetworkRepository } from "@/repositories/NetworkRepository";
import { ok, Result } from "neverthrow";
import {
  Network,
  Node,
  Organization,
  QuorumSet,
} from "@stellarbeat/js-stellarbeat-shared";

export class FBASRepository implements NetworkRepository {
  find(): Promise<Result<Network, Error>> {
    const organizations = [
      {
        id: "sp",
        name: "Satoshipay",
        validators: ["sp1", "sp2"],
        subQuorumAvailable: true,
      },
      {
        id: "lb",
        name: "LOBSTR",
        validators: ["lb1", "lb2"],
        subQuorumAvailable: true,
      },
      {
        id: "sdf",
        name: "SDF",
        validators: ["sdf1", "sdf2"],
        subQuorumAvailable: true,
      },
    ].map((organization) => {
      const org = new Organization(organization.id, organization.name);
      org.validators = organization.validators;
      org.subQuorumAvailable = organization.subQuorumAvailable;
      return org;
    });
    const nodes = [
      {
        ip: "localhost",
        port: 11625,
        publicKey: "sdf1",
        name: "SDF1",
        active: true,
        overLoaded: false,
        organizationId: "sdf",
        quorumSet: new QuorumSet(
          2,
          [],
          [
            new QuorumSet(1, ["lb1", "lb2"], []),
            new QuorumSet(1, ["sp1", "sp2"], []),
          ],
        ),
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11626,
        publicKey: "sdf2",
        name: "SDF2",
        active: true,
        overLoaded: false,
        organizationId: "sdf",
        quorumSet: new QuorumSet(
          2,
          [],
          [
            new QuorumSet(1, ["lb1", "lb2"], []),
            new QuorumSet(1, ["sp1", "sp2"], []),
          ],
        ),
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11627,
        publicKey: "lb1",
        name: "LOBSTR1",
        active: true,
        overLoaded: false,
        organizationId: "lb",
        quorumSet: new QuorumSet(
          2,
          [],
          [
            new QuorumSet(1, ["sdf1", "sdf2"], []),
            new QuorumSet(1, ["sp1", "sp2"], []),
          ],
        ),
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11628,
        publicKey: "lb2",
        name: "LOBSTR2",
        active: true,
        overLoaded: false,
        organizationId: "lb",
        quorumSet: new QuorumSet(
          2,
          [],
          [
            new QuorumSet(1, ["sdf1", "sdf2"], []),
            new QuorumSet(1, ["sp1", "sp2"], []),
          ],
        ),
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11629,
        publicKey: "sp1",
        name: "SatoshiPay1",
        organizationId: "sp",
        active: true,
        overLoaded: false,
        quorumSet: new QuorumSet(
          2,
          [],
          [
            new QuorumSet(1, ["sdf1", "sdf2"], []),
            new QuorumSet(1, ["lb1", "lb2"], []),
          ],
        ),
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11630,
        publicKey: "sp2",
        name: "SatoshiPay2",
        active: true,
        overLoaded: false,
        organizationId: "sp",
        quorumSet: new QuorumSet(
          2,
          [],
          [
            new QuorumSet(1, ["sdf1", "sdf2"], []),
            new QuorumSet(1, ["lb1", "lb2"], []),
          ],
        ),
        isValidator: true,
        isValidating: true,
      },
    ].map((node) => {
      const myNode = new Node(node.publicKey, node.ip, node.port);
      myNode.name = node.name;
      myNode.active = node.active;
      myNode.overLoaded = node.overLoaded;
      myNode.organizationId = node.organizationId;
      myNode.quorumSet = node.quorumSet;
      myNode.isValidating = node.isValidating;
      return myNode;
    });
    const network = new Network(nodes, organizations);
    network.networkStatistics.hasQuorumIntersection = false;
    network.networkStatistics.minBlockingSetCountryFilteredSize = 2;
    network.networkStatistics.minBlockingSetCountrySize = 2;
    network.networkStatistics.minBlockingSetFilteredSize = 2;
    network.networkStatistics.minBlockingSetOrgsFilteredSize = 1;
    network.networkStatistics.minBlockingSetISPFilteredSize = 2;
    network.networkStatistics.minSplittingSetSize = 0;
    network.networkStatistics.minSplittingSetOrgsSize = 0;
    network.networkStatistics.minSplittingSetCountrySize = 0;
    network.networkStatistics.minSplittingSetISPSize = 0;
    network.networkStatistics.topTierSize = 6;
    network.networkStatistics.topTierOrgsSize = 3;

    return Promise.resolve(ok(network));
  }
}
