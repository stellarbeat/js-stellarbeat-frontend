import axios from 'axios';
import Store from '@/store/Store';

export interface StatisticsAggregation {
    crawlCount: number;
}

export interface Statistics {
    time: Date
}

type route = string;
type parametersKey = string
export default class StatisticsStore {
    protected statisticsCache: Map<route, Map<parametersKey, Promise<any>>> = new Map();
    protected store: Store;

    public constructor(store: Store) {
        this.store = store;
    }

    protected async fetchStatisticsCached(id: string, from: Date, to: Date, route: string) {
        let statisticsCache = this.statisticsCache.get(this.store.getApiUrl() + route);
        if(!statisticsCache) {
            statisticsCache = new Map();
            this.statisticsCache.set(this.store.getApiUrl() + route, statisticsCache);
        }

        let params: any = {};
        params.from = from.toISOString();
        params.to = to.toISOString();
        let result;
        if (statisticsCache.get(id + params.from + params.to))
            result = await statisticsCache.get(id + params.from + params.to); //multiple charts can request the same endpoint at the same time.
        else {
            let promise = axios.get(this.store.getApiUrl() + route, {
                params
            });
            statisticsCache.set(id + params.from + params.to, promise);
            result = await promise;
        }

        return result.data;
    }

    async fetchStatistics<a extends Statistics>(id: string, from: Date, to: Date, route: string): Promise<a[]> {
        let stats = await this.fetchStatisticsCached(id, from, to, route);
        stats.forEach((stat: any) => stat.time = new Date(stat.time)); //todo: handle in fromJson domain object

        return stats;
    }
}
