import axios from "axios";
import {
  Network,
  Node,
  Organization,
  OrganizationId,
  OrganizationSnapShot,
  PublicKey,
  QuorumSet,
  QuorumSetService,
} from "@stellarbeat/js-stellar-domain";
import {
  NetworkChange,
  NetworkChangeQueue,
} from "@/services/change-queue/network-change-queue";
import { EntityPropertyUpdate } from "@/services/change-queue/changes/entity-property-update";
import { QuorumSetValidatorDelete } from "@/services/change-queue/changes/quorum-set-validator-delete";
import { InnerQuorumSetDelete } from "@/services/change-queue/changes/inner-quorum-set-delete";
import { InnerQuorumSetAdd } from "@/services/change-queue/changes/inner-quorum-set-add";
import { QuorumSetValidatorsAdd } from "@/services/change-queue/changes/quorum-set-validators-add";
import { NetworkAddNode } from "@/services/change-queue/changes/network-add-node";
import Vue from "vue";
import StatisticsStore from "@/store/StatisticsStore";
import NodeStatisticsStore from "@/store/NodeStatisticsStore";
import OrganizationStatisticsStore from "@/store/OrganizationStatisticsStore";
import NetworkStatisticsStore from "@/store/NetworkStatisticsStore";
import { NodeSnapShot } from "@stellarbeat/js-stellar-domain/lib/node-snap-shot";
import { QuorumSetOrganizationsAdd } from "@/services/change-queue/changes/quorum-set-organizations-add";
import LocalNetworks from "@/store/LocalNetworks";
import { AggregateChange } from "@/services/change-queue/changes/aggregate-change";
import NetworkAnalyzer from "@/services/NetworkAnalyzer";
import { MergeBy } from "@stellarbeat/stellar_analysis_web";
import { isString } from "@stellarbeat/js-stellar-domain/lib/typeguards";
import { RESTHistoryArchiveScanRepository } from "@/store/history-archive-scan/RESTHistoryArchiveScanRepository";

type NetworkId = string;

export default class Store {
  protected _network?: Network;
  protected _networkChangeQueue?: NetworkChangeQueue;
  protected _networkAnalyzer?: NetworkAnalyzer;
  public measurementsStartDate: Date = new Date("2019-06-01");
  public isLoading = true;
  public fetchingDataFailed = false;
  public networkReCalculated = 0; //to update graph views
  public centerNode?: Node = undefined;
  public selectedNode?: Node = undefined;
  public availableNetworks = ["public", "test", "fbas", "fbas2", "custom"];
  public availableNetworksPretty!: Map<string, string>;
  public networkId: NetworkId = "public";
  public isLocalNetwork = false;
  public selectedOrganization?: Organization = undefined;
  protected measurementStore: StatisticsStore = new StatisticsStore(this);
  public nodeMeasurementStore: NodeStatisticsStore = new NodeStatisticsStore(
    this.measurementStore
  );
  public networkMeasurementStore: NetworkStatisticsStore =
    new NetworkStatisticsStore(this.measurementStore);
  public organizationMeasurementStore: OrganizationStatisticsStore =
    new OrganizationStatisticsStore(this.measurementStore);
  public isHaltingAnalysisVisible = false;
  public isNetworkAnalysisVisible = false;
  public networkAnalysisMergeBy: MergeBy = MergeBy.DoNotMerge;
  public isTimeTravel = false;
  public timeTravelDate?: Date;
  public customNetwork: Network | undefined;

  public includeWatcherNodes = false;
  public watcherNodeFilter = (node: Node) => {
    return this.includeWatcherNodes || node.isValidator;
  };

  protected _haltingAnalysisPublicKey?: string = undefined;

  protected _uniqueId = 0;

  public historyArchiveScanRepository = new RESTHistoryArchiveScanRepository(
    this.getApiUrl()
  );

  constructor() {
    this.availableNetworksPretty = new Map();
    this.availableNetworksPretty.set("public", "Public network");
    this.availableNetworksPretty.set("test", "Testnet");
    this.availableNetworksPretty.set("fbas", "FBAS demo");
    this.availableNetworksPretty.set("fbas2", "FBAS QI demo");
  }

  get network(): Network {
    if (!this._network) throw new Error("Network not loaded correctly");

    return this._network;
  }

  setNetwork(network: Network) {
    Vue.set(this, "_network", network);
    Vue.set(this, "_networkAnalyzer", new NetworkAnalyzer(this.network));
    Vue.set(
      this,
      "_networkChangeQueue",
      new NetworkChangeQueue(this.network, this.networkAnalyzer)
    );
    this.networkReCalculated++;
  }

  get changeQueue(): NetworkChangeQueue {
    if (!this._networkChangeQueue) {
      throw new Error("Network not loaded correctly");
    }

    return this._networkChangeQueue;
  }

  get networkAnalyzer(): NetworkAnalyzer {
    if (!this._networkAnalyzer) {
      throw new Error("Network not loaded correctly");
    }

    return this._networkAnalyzer;
  }

  hydrateNetwork(networkDTO: Record<string, unknown>, networkId: string) {
    const network = Network.fromJSON(networkDTO);
    this.networkId = networkId;
    if (["fbas", "fbas2"].includes(this.networkId)) {
      this.isLocalNetwork = true;
    }

    this.setNetwork(network);
    this.isLoading = false;
  }
  public getNetworkIdPretty(networkId?: string): string | undefined {
    if (!networkId) networkId = this.networkId;
    return this.availableNetworksPretty.get(networkId);
  }

  getUniqueId() {
    return this._uniqueId++;
  }

  public showHaltingAnalysis(node: Node) {
    this.isHaltingAnalysisVisible = true;
    this._haltingAnalysisPublicKey = node.publicKey;
  }

  get haltingAnalysisPublicKey() {
    return this._haltingAnalysisPublicKey;
  }

  getApiUrl(): string {
    const key = "VUE_APP_" + this.networkId.toUpperCase() + "_API_URL";
    const url = process.env[key];
    if (!url) return "";

    return url;
  }

  async fetchNodeSnapshotsByPublicKey(id: PublicKey): Promise<NodeSnapShot[]> {
    const params: Record<string, unknown> = {};
    params["at"] = this.network.time;
    const result = await axios.get(
      this.getApiUrl() + "/v1/node/" + id + "/snapshots",
      { params }
    );
    if (result.data) {
      return result.data.map((item: Record<string, unknown>) =>
        NodeSnapShot.fromJSON(item)
      );
    }

    return [];
  }

  async fetchNodeSnapshots(): Promise<NodeSnapShot[]> {
    const params: Record<string, unknown> = {};
    params["at"] = this.network.time;
    const result = await axios.get(this.getApiUrl() + "/v1/node-snapshots", {
      params,
    });
    if (result.data) {
      return result.data.map((item: Record<string, unknown>) =>
        NodeSnapShot.fromJSON(item)
      );
    }

    return [];
  }

  async fetchOrganizationSnapshotsById(
    id: OrganizationId
  ): Promise<OrganizationSnapShot[]> {
    const params: Record<string, unknown> = {};
    params["at"] = this.network.time;
    const result = await axios.get(
      this.getApiUrl() + "/v1/organization/" + id + "/snapshots",
      { params }
    );
    if (result.data) {
      return result.data.map((item: Record<string, unknown>) =>
        OrganizationSnapShot.fromJSON(item)
      );
    }

    return [];
  }

  async fetchOrganizationSnapshots(): Promise<OrganizationSnapShot[]> {
    const params: Record<string, unknown> = {};
    params["at"] = this.network.time;
    const result = await axios.get(
      this.getApiUrl() + "/v1/organization-snapshots",
      { params }
    );
    if (result.data) {
      return result.data.map((item: Record<string, unknown>) =>
        OrganizationSnapShot.fromJSON(item)
      );
    }

    return [];
  }

  async initializeNetwork(at?: Date): Promise<void> {
    this.fetchingDataFailed = false;

    if (this.networkId === "fbas") {
      this.loadFBAS();
      this.isLocalNetwork = true;
      return new Promise(function (resolve) {
        resolve();
      });
    }

    if (this.networkId === "fbas2") {
      this.loadFBAS2();
      this.isLocalNetwork = true;
      return new Promise(function (resolve) {
        resolve();
      });
    }

    if (this.networkId === "custom") {
      this.isLocalNetwork = true;
      if (this.customNetwork !== undefined) this.loadCustomNetwork();
      else this.loadFBAS2();

      this.isLocalNetwork = true;
      return new Promise(function (resolve) {
        resolve();
      });
    }

    this.isLocalNetwork = false;
    try {
      const params: Record<string, unknown> = {};
      if (at) {
        params["at"] = at.toISOString();
        this.isTimeTravel = true;
        this.timeTravelDate = at;
      } else {
        this.isTimeTravel = false;
        this.timeTravelDate = undefined;
      }

      this.isLoading = true;
      const result = await axios.get(this.getApiUrl() + "/v1", { params });
      if (result.data) {
        const network = Network.fromJSON(result.data);
        this.setNetwork(network);
        this.isLoading = false;
        return;
      } else {
        this.fetchingDataFailed = true;
        this.isLoading = false;
      }
    } catch (error) {
      this.fetchingDataFailed = true;
      this.isLoading = false;
    }
  }

  public toggleOrganizationAvailability(organization: Organization) {
    const targetAvailability = !organization.subQuorumAvailable;
    const aggregateChange = new AggregateChange([
      new EntityPropertyUpdate(
        organization,
        "subQuorumAvailable",
        targetAvailability
      ),
      ...organization.validators.map((validator) => {
        const node = this.network.getNodeByPublicKey(validator);
        return new EntityPropertyUpdate(
          node,
          "isValidating",
          targetAvailability
        );
      }),
      ...organization.validators.map((validator) => {
        const node = this.network.getNodeByPublicKey(validator);
        return new EntityPropertyUpdate(
          node,
          "activeInScp",
          targetAvailability
        );
      }),
    ]);
    this.processChange(aggregateChange);
  }

  public toggleValidating(node: Node) {
    const changes = [];
    if (!node.active)
      changes.push(new EntityPropertyUpdate(node, "active", !node.active));

    changes.push(
      new EntityPropertyUpdate(node, "isValidating", !node.isValidating)
    );

    changes.push(
      new EntityPropertyUpdate(node, "activeInScp", !node.isValidating)
    );

    this.processChange(new AggregateChange(changes));
  }

  public editQuorumSetThreshold(quorumSet: QuorumSet, newThreshold: number) {
    if (quorumSet.threshold === newThreshold) {
      return;
    }

    this.processChange(
      new EntityPropertyUpdate(quorumSet, "threshold", newThreshold)
    );
  }

  public deleteValidatorFromQuorumSet(quorumSet: QuorumSet, validator: Node) {
    this.processChange(
      new QuorumSetValidatorDelete(quorumSet, validator.publicKey)
    );
  }

  public deleteInnerQuorumSet(quorumSet: QuorumSet, fromQuorumSet: QuorumSet) {
    this.processChange(new InnerQuorumSetDelete(fromQuorumSet, quorumSet));
  }

  public addInnerQuorumSet(toQuorumSet: QuorumSet) {
    this.processChange(new InnerQuorumSetAdd(toQuorumSet));
  }

  public addValidators(toQuorumSet: QuorumSet, validators: string[]) {
    this.processChange(new QuorumSetValidatorsAdd(toQuorumSet, validators));
  }

  public addOrganizations(
    toQuorumSet: QuorumSet,
    organizations: Organization[]
  ) {
    this.processChange(
      new QuorumSetOrganizationsAdd(toQuorumSet, organizations)
    );
  }

  public removeOrganizationFromOrganization(
    organization: Organization,
    fromOrganization: Organization
  ) {
    const fromNodes = fromOrganization.validators.map((publicKey) =>
      this.network.getNodeByPublicKey(publicKey)
    );

    const changes: NetworkChange[] = [];
    fromNodes.forEach((node) => {
      node.quorumSet.innerQuorumSets.forEach((qSet) => {
        if (
          QuorumSetService.isOrganizationQuorumSet(qSet, this.network) &&
          this.network.getNodeByPublicKey(qSet.validators[0]).organizationId ===
            organization.id
        ) {
          changes.push(new InnerQuorumSetDelete(node.quorumSet, qSet));
          changes.push(
            new EntityPropertyUpdate(
              node.quorumSet,
              "threshold",
              node.quorumSet.threshold - 1
            )
          );
        }
      });
    });

    this.processChange(new AggregateChange(changes));
  }

  public addOrganizationsToOrganization(
    organizations: Organization[],
    toOrganization: Organization
  ) {
    const toNodes = toOrganization.validators.map((publicKey) =>
      this.network.getNodeByPublicKey(publicKey)
    );

    const changes: NetworkChange[] = [];
    toNodes.forEach((node) => {
      changes.push(
        new QuorumSetOrganizationsAdd(node.quorumSet, organizations)
      );
      changes.push(
        new EntityPropertyUpdate(
          node.quorumSet,
          "threshold",
          node.quorumSet.threshold + 1
        )
      );
    });

    this.processChange(new AggregateChange(changes));
  }

  public processChange(change: NetworkChange) {
    this.changeQueue.execute(change);
    this.networkReCalculated++;
  }

  get isSimulation(): boolean {
    return this.changeQueue.hasUndo() || this.isLocalNetwork;
  }

  get hasUndo(): boolean {
    return this.changeQueue.hasUndo();
  }

  get hasRedo(): boolean {
    return this.changeQueue.hasRedo();
  }

  public undoUpdate() {
    if (!this.changeQueue.hasUndo()) {
      return;
    }
    this.changeQueue.undo();
    this.networkReCalculated++;
  }

  public redoUpdate() {
    if (!this.changeQueue.hasRedo()) {
      return;
    }
    this.changeQueue.redo();
    this.networkReCalculated++;
  }

  public addNodeToNetwork(node: Node) {
    this.changeQueue.execute(new NetworkAddNode(this.network, node));
    this.networkReCalculated++;
  }

  public resetUpdates() {
    if (!this.changeQueue.hasUndo()) {
      return;
    }
    this.changeQueue.reset();
    this.networkReCalculated++;
  }

  public loadCustomNetwork() {
    if (!this.customNetwork) {
      this.isLoading = false;
      return;
    }

    this.setNetwork(this.customNetwork);
    this.isLoading = false;
  }

  public loadFBAS() {
    const network = LocalNetworks.getFBASNetwork();
    this.setNetwork(network);
    this.isLoading = false;
  }

  public loadFBAS2() {
    const network = LocalNetworks.getFBAS2Network();
    this.setNetwork(network);
    this.isLoading = false;
  }

  //todo: needs better location
  getOrganizationFailingReason(organization: Organization) {
    if (this.network.isOrganizationBlocked(organization)) {
      return "Organization blocked: Validators not reaching quorumSet thresholds";
    } else {
      return "More then 50% of its validators are failing";
    }
  }

  public organizationHasWarnings(organization: Organization) {
    return (
      this.organizationHasOutOfDateHistoryArchives(organization) ||
      this.getOrganizationFailAt(organization) === 1 ||
      this.organizationHasHistoryArchivesWithError(organization)
    );
  }
  public organizationHasOutOfDateHistoryArchives(organization: Organization) {
    return organization.validators
      .map((validator) => this.network.getNodeByPublicKey(validator))
      .some((validator) => validator.historyUrl && !validator.isFullValidator);
  }

  public organizationHasHistoryArchivesWithError(organization: Organization) {
    return organization.validators
      .map((validator) => this.network.getNodeByPublicKey(validator))
      .some(
        (validator) => validator.historyUrl && validator.historyArchiveHasError
      );
  }

  getOrganizationWarningReason(organization: Organization) {
    if (this.getOrganizationFailAt(organization) === 1)
      return "If one more validator fails, this organization will fail";

    if (this.organizationHasHistoryArchivesWithError(organization)) {
      return "History archive verification error";
    }

    if (this.organizationHasOutOfDateHistoryArchives(organization))
      return "Not all history archives up-to-date";
  }

  someOrganizationsHaveWarnings(organizations: Organization[]) {
    return organizations.some(
      (organization) =>
        this.organizationHasWarnings(organization) ||
        this.network.isOrganizationFailing(organization)
    );
  }

  getOrganizationFailAt(organization: Organization) {
    const nrOfValidatingNodes = organization.validators
      .map((validator) => this.network.getNodeByPublicKey(validator))
      .filter((node) => !this.network.isNodeFailing(node)).length;

    return nrOfValidatingNodes - organization.subQuorumThreshold + 1;
  }

  getNetworkWarnings(): { label: string; description: string } {
    if (this.network.networkStatistics.minBlockingSetFilteredSize <= 2) {
      return {
        label: "Liveness risk",
        description:
          this.network.networkStatistics.minBlockingSetFilteredSize +
          " node(s) found that could halt the network if they fail",
      };
    }

    if (
      this.network.networkStatistics.minBlockingSetOrgsFilteredSize &&
      this.network.networkStatistics.minBlockingSetOrgsFilteredSize <= 1
    ) {
      return {
        label: "Liveness risk",
        description:
          "Organization found that could halt the network if it fails",
      };
    }

    return {
      label: "Ok",
      description: "No warnings",
    };
  }

  networkHasWarnings() {
    return this.getNetworkWarnings().label !== "Ok";
  }

  getNetworkDangers(): { label: string; description: string } {
    if (!this.network.networkStatistics.hasQuorumIntersection) {
      return {
        label: "Safety risk",
        description:
          "Network does not have quorum intersection and could have safety issues",
      };
    }

    if (!this.network.networkStatistics.hasTransitiveQuorumSet) {
      return {
        label: "Safety risk",
        description:
          "Network does not have a transitive quorum set and could have safety issues",
      };
    }

    if (this.network.networkStatistics.minBlockingSetFilteredSize === 0) {
      return {
        label: "Liveness risk",
        description:
          "Network could have liveness issues because all nodes in a blocking set are failing or Stellarbeat crawler is malfunctioning. Check https://dashboard.stellar.org",
      };
    }

    return {
      label: "Ok",
      description: "No dangers",
    };
  }

  networkHasDangers() {
    return this.getNetworkDangers().label !== "Ok";
  }

  getDateFromParam(date: unknown) {
    if (!isString(date)) return undefined;

    const timestamp = Date.parse(date);

    if (!isNaN(timestamp)) return new Date(timestamp);
    else return undefined;
  }

  copyAndModifyObject(
    myObject: Record<string, unknown>,
    propsToModifyOrAdd: { key: string; value: unknown }[] = [],
    propsToDelete: string[] = []
  ) {
    const copy: Record<string, unknown> = Object.assign({}, myObject);
    propsToModifyOrAdd.forEach((prop) => {
      copy[prop.key] = prop.value;
    });
    propsToDelete.forEach((prop) => {
      delete copy[prop];
    });

    return copy;
  }
}
