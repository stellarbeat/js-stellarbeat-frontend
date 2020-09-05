import StatisticsStore, {StatisticsAggregation, Statistics} from '@/store/StatisticsStore';
import NetworkStatisticsAggregation from '@stellarbeat/js-stellar-domain/lib/network-statistics-aggregation';
import NetworkStatistics from '@stellarbeat/js-stellar-domain/lib/network-statistics';

export default class NetworkStatisticsStore {

    protected statisticsStore: StatisticsStore;

    constructor(statisticsStore: StatisticsStore) {
        this.statisticsStore = statisticsStore;
    }

    async getMonthStatistics(networkId: string, from: Date, to: Date): Promise<NetworkStatisticsAggregation[]> {
        let stats = await this.statisticsStore.fetchStatistics<NetworkStatisticsAggregation>(networkId, from, to, '/v1/network/' + networkId + '/month-statistics');
        return stats.map(stat => {
            return NetworkStatisticsAggregation.fromJSON(JSON.stringify(stat))
        })//todo handle better, but needs refactoring of node and organization stats
    }

    async getDayStatistics(networkId: string, from: Date, to: Date): Promise<NetworkStatisticsAggregation[]> {
        return await this.statisticsStore.fetchStatistics<NetworkStatisticsAggregation>(networkId, from, to, '/v1/network/' + networkId + '/day-statistics');
    }

    async getStatistics(networkId: string, from: Date, to: Date): Promise<NetworkStatistics[]> {
        return await this.statisticsStore.fetchStatistics<NetworkStatistics>(networkId, from, to, '/v1/network/' + networkId + '/statistics');
    }
}