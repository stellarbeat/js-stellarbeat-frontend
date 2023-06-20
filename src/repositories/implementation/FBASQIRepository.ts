import { NetworkRepository } from "@/repositories/NetworkRepository";
import {
  Network,
  Node,
  Organization,
  QuorumSet,
} from "@stellarbeat/js-stellarbeat-shared";
import { ok, Result } from "neverthrow";

export class FBASQIRepository implements NetworkRepository {
  find(): Promise<Result<Network, Error>> {
    const organizations = [
      {
        id: "sp",
        name: "Satoshipay",
        validators: ["sp1", "sp2", "sp3"],
        subQuorumAvailable: true,
      },
      {
        id: "lb",
        name: "LOBSTR",
        validators: ["lb1", "lb2", "lb3"],
        subQuorumAvailable: true,
      },
      {
        id: "sdf",
        name: "SDF",
        validators: ["sdf1", "sdf2", "sdf3"],
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
          3,
          [],
          [
            new QuorumSet(2, ["lb1", "lb2", "lb3"], []),
            new QuorumSet(2, ["sp1", "sp2", "sp3"], []),
            new QuorumSet(2, ["sdf1", "sdf2", "sdf3"], []),
          ]
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
          3,
          [],
          [
            new QuorumSet(2, ["lb1", "lb2", "lb3"], []),
            new QuorumSet(2, ["sp1", "sp2", "sp3"], []),
            new QuorumSet(2, ["sdf1", "sdf2", "sdf3"], []),
          ]
        ),
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11627,
        publicKey: "sdf3",
        name: "SDF3",
        active: true,
        overLoaded: false,
        organizationId: "sdf",
        quorumSet: new QuorumSet(
          3,
          [],
          [
            new QuorumSet(2, ["lb1", "lb2", "lb3"], []),
            new QuorumSet(2, ["sp1", "sp2", "sp3"], []),
            new QuorumSet(2, ["sdf1", "sdf2", "sdf3"], []),
          ]
        ),
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11628,
        publicKey: "lb1",
        name: "LOBSTR1",
        active: true,
        overLoaded: false,
        organizationId: "lb",
        quorumSet: new QuorumSet(
          3,
          [],
          [
            new QuorumSet(2, ["lb1", "lb2", "lb3"], []),
            new QuorumSet(2, ["sp1", "sp2", "sp3"], []),
            new QuorumSet(2, ["sdf1", "sdf2", "sdf3"], []),
          ]
        ),
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11629,
        publicKey: "lb2",
        name: "LOBSTR2",
        active: true,
        overLoaded: false,
        organizationId: "lb",
        quorumSet: new QuorumSet(
          3,
          [],
          [
            new QuorumSet(2, ["lb1", "lb2", "lb3"], []),
            new QuorumSet(2, ["sp1", "sp2", "sp3"], []),
            new QuorumSet(2, ["sdf1", "sdf2", "sdf3"], []),
          ]
        ),
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11630,
        publicKey: "lb3",
        name: "LOBSTR3",
        active: true,
        overLoaded: false,
        organizationId: "lb",
        quorumSet: new QuorumSet(
          3,
          [],
          [
            new QuorumSet(2, ["lb1", "lb2", "lb3"], []),
            new QuorumSet(2, ["sp1", "sp2", "sp3"], []),
            new QuorumSet(2, ["sdf1", "sdf2", "sdf3"], []),
          ]
        ),
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11631,
        publicKey: "sp1",
        name: "SatoshiPay1",
        organizationId: "sp",
        active: true,
        overLoaded: false,
        quorumSet: new QuorumSet(
          3,
          [],
          [
            new QuorumSet(2, ["lb1", "lb2", "lb3"], []),
            new QuorumSet(2, ["sp1", "sp2", "sp3"], []),
            new QuorumSet(2, ["sdf1", "sdf2", "sdf3"], []),
          ]
        ),
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11632,
        publicKey: "sp2",
        name: "SatoshiPay2",
        active: true,
        overLoaded: false,
        organizationId: "sp",
        quorumSet: new QuorumSet(
          3,
          [],
          [
            new QuorumSet(2, ["lb1", "lb2", "lb3"], []),
            new QuorumSet(2, ["sp1", "sp2", "sp3"], []),
            new QuorumSet(2, ["sdf1", "sdf2", "sdf3"], []),
          ]
        ),
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11633,
        publicKey: "sp3",
        name: "SatoshiPay3",
        organizationId: "sp",
        active: true,
        overLoaded: false,
        quorumSet: new QuorumSet(
          3,
          [],
          [
            new QuorumSet(2, ["lb1", "lb2", "lb3"], []),
            new QuorumSet(2, ["sp1", "sp2", "sp3"], []),
            new QuorumSet(2, ["sdf1", "sdf2", "sdf3"], []),
          ]
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
    network.networkStatistics.hasQuorumIntersection = true;
    network.networkStatistics.minBlockingSetCountryFilteredSize = 2;
    network.networkStatistics.minBlockingSetCountrySize = 2;
    network.networkStatistics.minBlockingSetFilteredSize = 2;
    network.networkStatistics.minBlockingSetOrgsFilteredSize = 1;
    network.networkStatistics.minBlockingSetISPFilteredSize = 2;
    network.networkStatistics.minSplittingSetSize = 3;
    network.networkStatistics.minSplittingSetOrgsSize = 3;
    network.networkStatistics.minSplittingSetCountrySize = 3;
    network.networkStatistics.minSplittingSetISPSize = 3;
    network.networkStatistics.topTierSize = 9;
    network.networkStatistics.topTierOrgsSize = 3;

    return Promise.resolve(ok(network));
  }
}
