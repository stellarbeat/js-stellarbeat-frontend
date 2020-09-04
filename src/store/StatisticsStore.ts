import axios from 'axios';

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

    protected async fetchStatisticsCached(id: string, from: Date, to: Date, route: string) {
        let statisticsCache = this.statisticsCache.get(route);
        if(!statisticsCache) {
            statisticsCache = new Map();
            this.statisticsCache.set(route, statisticsCache);
        }

        let params: any = {};
        params.from = from.toISOString();
        params.to = to.toISOString();
        let result;
        if (statisticsCache.get(id + params.from + params.to))
            result = await statisticsCache.get(id + params.from + params.to); //multiple charts can request the same endpoint at the same time.
        else {
            let promise = axios.get(process.env.VUE_APP_API_URL + route, {
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
