import { NetworkRepository } from "@/repositories/NetworkRepository";
import { StellarBeatNetworkV1Repository } from "@/repositories/implementation/StellarBeatNetworkV1Repository";
import { isString } from "@stellarbeat/js-stellar-domain/lib/typeguards";
import { FBASRepository } from "@/repositories/implementation/FBASRepository";
import { FBASQIRepository } from "@/repositories/implementation/FBASQIRepository";

export interface NetworkContext {
  networkId: NetworkId; //todo: id
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
  brandName = "Stellarbeat.io";
  brandTagline = "Stellar network visibility";
  brandImgSrc = "logo.svg"; //assets folder
  brandImgAlt = "https://stellarbeat.io";
  enableBrandImg = true;

  constructor() {
    this.blogUrl = process.env["VUE_APP_BLOG_URL"];
    this.apiDocUrl = process.env["VUE_APP_API_DOC_URL"];
    if (!isString(process.env["VUE_APP_PUBLIC_API_URL"]))
      throw new Error("VUE_APP_PUBLIC_API_URL not set");
    if (isString(process.env["VUE_APP_BRAND_NAME"]))
      this.brandName = process.env["VUE_APP_BRAND_NAME"];
    if (isString(process.env["VUE_APP_BRAND_TAGLINE"]))
      this.brandTagline = process.env["VUE_APP_BRAND_TAGLINE"];
    if (isString(process.env["VUE_APP_BRAND_IMG_SRC"]))
      this.brandImgSrc = process.env["VUE_APP_BRAND_IMG_SRC"];
    if (isString(process.env["VUE_APP_BRAND_IMG_ALT"]))
      this.brandImgAlt = process.env["VUE_APP_BRAND_IMG_ALT"];
    if (process.env["VUE_APP_ENABLE_BRAND_IMG"])
      this.enableBrandImg = process.env["VUE_APP_ENABLE_BRAND_IMG"] === "1";

    //todo: can be made more generic by defining available networks in config. This will do for now.
    this.networkContexts.set("public", {
      networkId: "public",
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
      enableHorizon: process.env["VUE_APP_PUBLIC_ENABLE_HORIZON"]
        ? process.env["VUE_APP_PUBLIC_ENABLE_HORIZON"] === "1"
        : true,
      enableValidatorLoad: process.env["VUE_APP_PUBLIC_ENABLE_VALIDATOR_LOAD"]
        ? process.env["VUE_APP_PUBLIC_ENABLE_VALIDATOR_LOAD"] === "1"
        : true,
      enableConfigExport: process.env["VUE_APP_PUBLIC_ENABLE_CONFIG_EXPORT"]
        ? process.env["VUE_APP_PUBLIC_ENABLE_CONFIG_EXPORT"] === "1"
        : true,
    });

    if (isString(process.env["VUE_APP_TEST_API_URL"]))
      this.networkContexts.set("test", {
        networkId: "test",
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
        enableHorizon: process.env["VUE_APP_TEST_ENABLE_HORIZON"]
          ? process.env["VUE_APP_TEST_ENABLE_HORIZON"] === "1"
          : true,
        enableValidatorLoad: process.env["VUE_APP_TEST_ENABLE_VALIDATOR_LOAD"]
          ? process.env["VUE_APP_TEST_ENABLE_VALIDATOR_LOAD"] === "1"
          : true,
        enableConfigExport: process.env["VUE_APP_TEST_ENABLE_CONFIG_EXPORT"]
          ? process.env["VUE_APP_TEST_ENABLE_CONFIG_EXPORT"] === "1"
          : true,
      });

    if (process.env["VUE_APP_ENABLE_DEMO_NETWORKS"] === "1") {
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
      });
    }
  }
}
