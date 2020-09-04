import StatisticsStore, {StatisticsAggregation, Statistics} from '@/store/StatisticsStore';
import NetworkStatisticsAggregation from '@stellarbeat/js-stellar-domain/lib/network-statistics-aggregation';
import NetworkStatistics from '@stellarbeat/js-stellar-domain/lib/network-statistics';

export default class NetworkStatisticsStore {

    protected statisticsStore: StatisticsStore;

    constructor(statisticsStore: StatisticsStore) {
        this.statisticsStore = statisticsStore;
    }

    async getMonthMeasurements(networkId: string, from: Date, to: Date): Promise<NetworkStatisticsAggregation[]> {
        return await this.statisticsStore.fetchStatistics<NetworkStatisticsAggregation>(networkId, from, to, '/v1/network/' + networkId + '/month-statistics');
    }

    async getDayMeasurements(networkId: string, from: Date, to: Date): Promise<NetworkStatisticsAggregation[]> {
        return await this.statisticsStore.fetchStatistics<NetworkStatisticsAggregation>(networkId, from, to, '/v1/network/' + networkId + '/day-statistics');
    }

    async getMeasurements(networkId: string, from: Date, to: Date): Promise<NetworkStatistics[]> {
        return await this.statisticsStore.fetchStatistics<NetworkStatistics>(networkId, from, to, '/v1/network/' + networkId + '/statistics');
    }
}