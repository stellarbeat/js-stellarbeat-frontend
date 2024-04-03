import StatisticsStore, {
  type Statistics,
  type StatisticsAggregation,
} from "@/store/StatisticsStore";

export interface NodeDayStatistics extends StatisticsAggregation {
  time: Date;
  isActiveCount: number;
  isValidatingCount: number;
  isFullValidatorCount: number;
  isOverloadedCount: number;
  indexSum: number;
  crawlCount: number;
}

export interface NodeStatistics extends Statistics {
  time: Date;
  isActive: boolean;
  isValidating: boolean;
  isFullValidator: boolean;
  isOverloaded: boolean;
  index: number;
}

export default class NodeStatisticsStore {
  protected statisticsStore: StatisticsStore;

  constructor(statisticsStore: StatisticsStore) {
    this.statisticsStore = statisticsStore;
  }

  async getDayStatistics(
    id: string,
    from: Date,
    to: Date,
  ): Promise<NodeDayStatistics[]> {
    return await this.statisticsStore.fetchStatistics<NodeDayStatistics>(
      id,
      from,
      to,
      "/v1/node/" + id + "/day-statistics",
    );
  }

  async getStatistics(
    id: string,
    from: Date,
    to: Date,
  ): Promise<NodeStatistics[]> {
    return await this.statisticsStore.fetchStatistics<NodeStatistics>(
      id,
      from,
      to,
      "/v1/node/" + id + "/statistics",
    );
  }
}
