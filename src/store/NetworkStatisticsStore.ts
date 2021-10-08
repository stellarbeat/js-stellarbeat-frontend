import StatisticsStore from "@/store/StatisticsStore";
import NetworkStatisticsAggregation from "@stellarbeat/js-stellar-domain/lib/network-statistics-aggregation";
import NetworkStatistics from "@stellarbeat/js-stellar-domain/lib/network-statistics";

export default class NetworkStatisticsStore {
  protected statisticsStore: StatisticsStore;

  constructor(statisticsStore: StatisticsStore) {
    this.statisticsStore = statisticsStore;
  }

  async getMonthStatistics(
    networkId: string,
    from: Date,
    to: Date
  ): Promise<NetworkStatisticsAggregation[]> {
    const stats =
      await this.statisticsStore.fetchStatistics<NetworkStatisticsAggregation>(
        networkId,
        from,
        to,
        "/v1/month-statistics"
      );
    return stats.map((stat) => {
      return NetworkStatisticsAggregation.fromJSON(JSON.stringify(stat));
    }); //todo handle better, but needs refactoring of node and organization stats
  }

  async getDayStatistics(
    networkId: string,
    from: Date,
    to: Date
  ): Promise<NetworkStatisticsAggregation[]> {
    const stats =
      await this.statisticsStore.fetchStatistics<NetworkStatisticsAggregation>(
        networkId,
        from,
        to,
        "/v1/day-statistics"
      );
    return stats.map((stat) => {
      return NetworkStatisticsAggregation.fromJSON(JSON.stringify(stat));
    }); //todo handle better, but needs refactoring of node and organization stats
  }

  async getStatistics(
    networkId: string,
    from: Date,
    to: Date
  ): Promise<NetworkStatistics[]> {
    return await this.statisticsStore.fetchStatistics<NetworkStatistics>(
      networkId,
      from,
      to,
      "/v1/statistics"
    );
  }
}
