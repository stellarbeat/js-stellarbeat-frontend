import { NetworkRepository } from "@/repositories/NetworkRepository";
import { StellarBeatNetworkV1Repository } from "@/repositories/implementation/StellarBeatNetworkV1Repository";
import { isString } from "@stellarbeat/js-stellar-domain/lib/typeguards";
import { FBASRepository } from "@/repositories/implementation/FBASRepository";
import { FBASQIRepository } from "@/repositories/implementation/FBASQIRepository";

export interface NetworkContext {
  slug: NetworkSlug;
  name: string;
  repository: NetworkRepository;
  enableNotify: boolean;
  enableHistory: boolean;
  //@deprecated can be removed once all fetching logic is encapsulated in repositories
  apiBaseUrl?: string;
  enableIndex: boolean;
  isSimulation: boolean;
}

export type NetworkSlug = string;

export default class Config {
  networkContexts: Map<NetworkSlug, NetworkContext> = new Map();
  apiDocUrl?: string;
  blogUrl?: string;

  constructor() {
    this.blogUrl = process.env["VUE_APP_BLOG_URL"];
    console.log(this.blogUrl);
    this.apiDocUrl = process.env["VUE_APP_API_DOC_URL"];
    if (!isString(process.env["VUE_APP_PUBLIC_API_URL"]))
      throw new Error("VUE_APP_PUBLIC_API_URL not set");

    //todo: can be made more generic by defining available networks in config. This will do for now.
    this.networkContexts.set("public", {
      slug: "public",
      name: "Public network",
      repository: new StellarBeatNetworkV1Repository(
        process.env["VUE_APP_PUBLIC_API_URL"]
      ),
      enableNotify: process.env["VUE_APP_PUBLIC_ENABLE_NOTIFY"] === "1",
      enableHistory: process.env["VUE_APP_PUBLIC_ENABLE_HISTORY"]
        ? process.env["VUE_APP_PUBLIC_ENABLE_HISTORY"] === "1"
        : true,
      apiBaseUrl: process.env["VUE_APP_PUBLIC_API_URL"],
      enableIndex: true,
      isSimulation: false,
    });

    if (isString(process.env["VUE_APP_TEST_API_URL"]))
      this.networkContexts.set("test", {
        slug: "test",
        name: "Testnet",
        repository: new StellarBeatNetworkV1Repository(
          process.env["VUE_APP_TEST_API_URL"]
        ),
        enableNotify: process.env["VUE_APP_TEST_ENABLE_NOTIFY"] === "1",
        enableHistory: process.env["VUE_APP_TEST_ENABLE_HISTORY"]
          ? process.env["VUE_APP_TEST_ENABLE_HISTORY"] === "1"
          : true,
        apiBaseUrl: process.env["VUE_APP_TEST_API_URL"],
        enableIndex: true,
        isSimulation: false,
      });

    if (process.env["VUE_APP_ENABLE_DEMO_NETWORKS"] === "1") {
      this.networkContexts.set("fbas", {
        slug: "fbas",
        name: "FBAS demo",
        repository: new FBASRepository(),
        enableNotify: false,
        enableHistory: false,
        enableIndex: false,
        isSimulation: true,
      });

      this.networkContexts.set("fbas2", {
        slug: "fbas2",
        name: "FBAS QI demo",
        repository: new FBASQIRepository(),
        enableNotify: false,
        enableHistory: false,
        enableIndex: false,
        isSimulation: true,
      });
    }
  }
}
