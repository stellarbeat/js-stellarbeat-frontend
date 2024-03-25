import StatisticsStore, {
  StatisticsAggregation,
  Statistics,
} from "@/store/StatisticsStore";

export interface OrganizationDayStatistics extends StatisticsAggregation {
  time: Date;
  isSubQuorumAvailableCount: number;
  crawlCount: number;
}

export interface OrganizationStatistic extends Statistics {
  time: Date;
  isSubQuorumAvailable: boolean;
}

export default class OrganizationStatisticsStore {
  protected statisticsStore: StatisticsStore;

  constructor(statisticsStore: StatisticsStore) {
    this.statisticsStore = statisticsStore;
  }

  async getDayStatistics(
    organizationId: string,
    from: Date,
    to: Date,
  ): Promise<OrganizationDayStatistics[]> {
    return await this.statisticsStore.fetchStatistics<OrganizationDayStatistics>(
      organizationId,
      from,
      to,
      "/v1/organization/" + organizationId + "/day-statistics",
    );
  }

  async getStatistics(
    organizationId: string,
    from: Date,
    to: Date,
  ): Promise<OrganizationStatistic[]> {
    return await this.statisticsStore.fetchStatistics<OrganizationStatistic>(
      organizationId,
      from,
      to,
      "/v1/organization/" + organizationId + "/statistics",
    );
  }
}
