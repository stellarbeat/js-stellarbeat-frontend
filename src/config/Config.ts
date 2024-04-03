import { type NetworkRepository } from "@/repositories/NetworkRepository";
import { StellarBeatNetworkV1Repository } from "@/repositories/implementation/StellarBeatNetworkV1Repository";
import { isString } from "@stellarbeat/js-stellarbeat-shared/lib/typeguards";
import { FBASRepository } from "@/repositories/implementation/FBASRepository";
import { FBASQIRepository } from "@/repositories/implementation/FBASQIRepository";

export interface NetworkContext {
  networkId: NetworkId;
  name: string;
  repository: NetworkRepository;
  enableNotify: boolean;
  enableHistory: boolean;
  //@deprecated can be removed once all fetching logic is encapsulated in repositories
  apiBaseUrl?: string;
  enableIndex: boolean;
  isSimulation: boolean;
  enableHorizon: boolean;
  enableValidatorLoad: boolean;
  enableConfigExport: boolean;
}

export type NetworkId = string;

export default class Config {
  networkContexts: Map<NetworkId, NetworkContext> = new Map();
  apiDocUrl?: string;
  blogUrl?: string;
  brandName = "Stellarbeat";
  brandTagline = "Stellar network explorer";
  brandDescription =
    "Stellarbeat is a network explorer for the Stellar network. It provides a list of all nodes and organizations. It tracks various metrics and provides a history of changes. And it allows you to simulate different network conditions and topologies";
  brandLogoSrc = "logo.svg"; //assets folder
  brandLogoAlt = "https://stellarbeat.io";
  brandEmail = "info@stellarbeat.io";

  constructor() {
    this.blogUrl = import.meta.env["VUE_APP_BLOG_URL"];
    this.apiDocUrl = import.meta.env["VUE_APP_API_DOC_URL"];

    if (isString(import.meta.env["VUE_APP_BRAND_NAME"]))
      this.brandName = import.meta.env["VUE_APP_BRAND_NAME"];
    if (isString(import.meta.env["VUE_APP_BRAND_TAGLINE"]))
      this.brandTagline = import.meta.env["VUE_APP_BRAND_TAGLINE"];
    if (isString(import.meta.env["VUE_APP_BRAND_DESCRIPTION"]))
      this.brandDescription = import.meta.env["VUE_APP_BRAND_DESCRIPTION"];
    if (isString(import.meta.env["VUE_APP_BRAND_LOGO_SRC"]))
      this.brandLogoSrc = import.meta.env["VUE_APP_BRAND_LOGO_SRC"];
    if (isString(import.meta.env["VUE_APP_BRAND_LOGO_ALT"]))
      this.brandLogoAlt = import.meta.env["VUE_APP_BRAND_LOGO_ALT"];
    if (isString(import.meta.env["VUE_APP_BRAND_EMAIL"]))
      this.brandEmail = import.meta.env["VUE_APP_BRAND_EMAIL"];

    if (!isString(import.meta.env["VUE_APP_PUBLIC_API_URL"]))
      throw new Error("VUE_APP_PUBLIC_API_URL not set");

    //todo: can be made more generic by defining available networks in config. This will do for now.
    this.networkContexts.set("public", {
      networkId: "public",
      name: "Public network",
      repository: new StellarBeatNetworkV1Repository(
        import.meta.env["VUE_APP_PUBLIC_API_URL"],
      ),
      enableNotify: import.meta.env["VUE_APP_PUBLIC_ENABLE_NOTIFY"] === "1",
      enableHistory: import.meta.env["VUE_APP_PUBLIC_ENABLE_HISTORY"]
        ? import.meta.env["VUE_APP_PUBLIC_ENABLE_HISTORY"] === "1"
        : true,
      apiBaseUrl: import.meta.env["VUE_APP_PUBLIC_API_URL"],
      enableIndex: true,
      isSimulation: false,
      enableHorizon: import.meta.env["VUE_APP_PUBLIC_ENABLE_HORIZON"]
        ? import.meta.env["VUE_APP_PUBLIC_ENABLE_HORIZON"] === "1"
        : true,
      enableValidatorLoad: import.meta.env[
        "VUE_APP_PUBLIC_ENABLE_VALIDATOR_LOAD"
      ]
        ? import.meta.env["VUE_APP_PUBLIC_ENABLE_VALIDATOR_LOAD"] === "1"
        : true,
      enableConfigExport: import.meta.env["VUE_APP_PUBLIC_ENABLE_CONFIG_EXPORT"]
        ? import.meta.env["VUE_APP_PUBLIC_ENABLE_CONFIG_EXPORT"] === "1"
        : true,
    });

    if (isString(import.meta.env["VUE_APP_TEST_API_URL"])) {
      if (!isString(import.meta.env["VUE_APP_TEST_API_URL"]))
        throw new Error("VUE_APP_TEST_API_URL not set");

      this.networkContexts.set("test", {
        networkId: "test",
        name: "Testnet",
        repository: new StellarBeatNetworkV1Repository(
          import.meta.env["VUE_APP_TEST_API_URL"],
        ),
        enableNotify: import.meta.env["VUE_APP_TEST_ENABLE_NOTIFY"] === "1",
        enableHistory: import.meta.env["VUE_APP_TEST_ENABLE_HISTORY"]
          ? import.meta.env["VUE_APP_TEST_ENABLE_HISTORY"] === "1"
          : true,
        apiBaseUrl: import.meta.env["VUE_APP_TEST_API_URL"],
        enableIndex: true,
        isSimulation: false,
        enableHorizon: import.meta.env["VUE_APP_TEST_ENABLE_HORIZON"]
          ? import.meta.env["VUE_APP_TEST_ENABLE_HORIZON"] === "1"
          : true,
        enableValidatorLoad: import.meta.env[
          "VUE_APP_TEST_ENABLE_VALIDATOR_LOAD"
        ]
          ? import.meta.env["VUE_APP_TEST_ENABLE_VALIDATOR_LOAD"] === "1"
          : true,
        enableConfigExport: import.meta.env["VUE_APP_TEST_ENABLE_CONFIG_EXPORT"]
          ? import.meta.env["VUE_APP_TEST_ENABLE_CONFIG_EXPORT"] === "1"
          : true,
      });
    }

    if (import.meta.env["VUE_APP_ENABLE_DEMO_NETWORKS"] === "1") {
      this.networkContexts.set("fbas", {
        networkId: "fbas",
        name: "FBAS demo",
        repository: new FBASRepository(),
        enableNotify: false,
        enableHistory: false,
        enableIndex: false,
        isSimulation: true,
        enableHorizon: false,
        enableValidatorLoad: false,
        enableConfigExport: false,
        apiBaseUrl: "localhost",
      });

      this.networkContexts.set("fbas2", {
        networkId: "fbas2",
        name: "FBAS QI demo",
        repository: new FBASQIRepository(),
        enableNotify: false,
        enableHistory: false,
        enableIndex: false,
        isSimulation: true,
        enableHorizon: false,
        enableValidatorLoad: false,
        enableConfigExport: false,
        apiBaseUrl: "localhost",
      });
    }
  }
}
