import { Network, Node, Organization } from "@stellarbeat/js-stellar-domain";

export default class LocalNetworks {
  static getFBASNetwork() {
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
    ].map((organization) => Organization.fromJSON(organization));
    const nodes = [
      {
        ip: "localhost",
        port: 11625,
        publicKey: "sdf1",
        name: "SDF1",
        active: true,
        overLoaded: false,
        organizationId: "sdf",
        quorumSet: {
          threshold: 2,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 1,
              validators: ["lb1", "lb2"],
              innerQuorumSets: [],
            },
            {
              threshold: 1,
              validators: ["sp1", "sp2"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "sdf2",
        name: "SDF2",
        active: true,
        overLoaded: false,
        organizationId: "sdf",
        quorumSet: {
          threshold: 2,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 1,
              validators: ["lb1", "lb2"],
              innerQuorumSets: [],
            },
            {
              threshold: 1,
              validators: ["sp1", "sp2"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "lb1",
        name: "LOBSTR1",
        active: true,
        overLoaded: false,
        organizationId: "lb",
        quorumSet: {
          threshold: 2,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 1,
              validators: ["sdf1", "sdf2"],
              innerQuorumSets: [],
            },
            {
              threshold: 1,
              validators: ["sp1", "sp2"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "lb2",
        name: "LOBSTR2",
        active: true,
        overLoaded: false,
        organizationId: "lb",
        quorumSet: {
          threshold: 2,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 1,
              validators: ["sdf1", "sdf2"],
              innerQuorumSets: [],
            },
            {
              threshold: 1,
              validators: ["sp1", "sp2"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "sp1",
        name: "SatoshiPay1",
        organizationId: "sp",
        active: true,
        overLoaded: false,
        quorumSet: {
          threshold: 2,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 1,
              validators: ["sdf1", "sdf2"],
              innerQuorumSets: [],
            },
            {
              threshold: 1,
              validators: ["lb1", "lb2"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "sp2",
        name: "SatoshiPay2",
        active: true,
        overLoaded: false,
        organizationId: "sp",
        quorumSet: {
          threshold: 2,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 1,
              validators: ["sdf1", "sdf2"],
              innerQuorumSets: [],
            },
            {
              threshold: 1,
              validators: ["lb1", "lb2"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
    ].map((node) => Node.fromJSON(node));
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

    return network;
  }

  static getFBAS2Network() {
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
    ].map((organization) => Organization.fromJSON(organization));
    const nodes = [
      {
        ip: "localhost",
        port: 11625,
        publicKey: "sdf1",
        name: "SDF1",
        active: true,
        overLoaded: false,
        organizationId: "sdf",
        quorumSet: {
          threshold: 3,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 2,
              validators: ["lb1", "lb2", "lb3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sp1", "sp2", "sp3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sdf1", "sdf2", "sdf3"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "sdf2",
        name: "SDF2",
        active: true,
        overLoaded: false,
        organizationId: "sdf",
        quorumSet: {
          threshold: 3,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 2,
              validators: ["lb1", "lb2", "lb3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sp1", "sp2", "sp3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sdf1", "sdf2", "sdf3"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "sdf3",
        name: "SDF3",
        active: true,
        overLoaded: false,
        organizationId: "sdf",
        quorumSet: {
          threshold: 3,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 2,
              validators: ["lb1", "lb2", "lb3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sp1", "sp2", "sp3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sdf1", "sdf2", "sdf3"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "lb1",
        name: "LOBSTR1",
        active: true,
        overLoaded: false,
        organizationId: "lb",
        quorumSet: {
          threshold: 3,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 2,
              validators: ["lb1", "lb2", "lb3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sp1", "sp2", "sp3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sdf1", "sdf2", "sdf3"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "lb2",
        name: "LOBSTR2",
        active: true,
        overLoaded: false,
        organizationId: "lb",
        quorumSet: {
          threshold: 3,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 2,
              validators: ["lb1", "lb2", "lb3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sp1", "sp2", "sp3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sdf1", "sdf2", "sdf3"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "lb3",
        name: "LOBSTR3",
        active: true,
        overLoaded: false,
        organizationId: "lb",
        quorumSet: {
          threshold: 3,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 2,
              validators: ["lb1", "lb2", "lb3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sp1", "sp2", "sp3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sdf1", "sdf2", "sdf3"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "sp1",
        name: "SatoshiPay1",
        organizationId: "sp",
        active: true,
        overLoaded: false,
        quorumSet: {
          threshold: 3,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 2,
              validators: ["lb1", "lb2", "lb3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sp1", "sp2", "sp3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sdf1", "sdf2", "sdf3"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "sp2",
        name: "SatoshiPay2",
        active: true,
        overLoaded: false,
        organizationId: "sp",
        quorumSet: {
          threshold: 3,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 2,
              validators: ["lb1", "lb2", "lb3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sp1", "sp2", "sp3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sdf1", "sdf2", "sdf3"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
      {
        ip: "localhost",
        port: 11625,
        publicKey: "sp3",
        name: "SatoshiPay3",
        organizationId: "sp",
        active: true,
        overLoaded: false,
        quorumSet: {
          threshold: 3,
          validators: [],
          innerQuorumSets: [
            {
              threshold: 2,
              validators: ["lb1", "lb2", "lb3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sp1", "sp2", "sp3"],
              innerQuorumSets: [],
            },
            {
              threshold: 2,
              validators: ["sdf1", "sdf2", "sdf3"],
              innerQuorumSets: [],
            },
          ],
        },
        isValidator: true,
        isValidating: true,
      },
    ].map((node) => Node.fromJSON(node));

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

    return network;
  }
}
