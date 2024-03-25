// noinspection ES6MissingAwait

import Store from "@/store/Store";
import {
  isArray,
  isObject,
} from "@stellarbeat/js-stellarbeat-shared/lib/typeguards";

export interface StatisticsAggregation extends Statistics {
  crawlCount: number;
}

export interface Statistics {
  time: Date;
}

type route = string;
type parametersKey = string;
export default class StatisticsStore {
  protected statisticsCache: Map<route, Map<parametersKey, Promise<Response>>> =
    new Map();
  protected store: Store;

  public constructor(store: Store) {
    this.store = store;
  }

  protected async fetchStatisticsCached(
    id: string,
    from: Date,
    to: Date,
    route: string,
  ): Promise<unknown[]> {
    let statisticsCache = this.statisticsCache.get(
      this.store.networkContext.apiBaseUrl + route,
    );
    if (!statisticsCache) {
      statisticsCache = new Map();
      this.statisticsCache.set(
        this.store.networkContext.apiBaseUrl + route,
        statisticsCache,
      );
    }

    const params: Record<string, unknown> = {};
    params.from = from.toISOString();
    params.to = to.toISOString();
    let result;
    if (statisticsCache.get(id + params.from + params.to))
      result = await statisticsCache.get(id + params.from + params.to);
    else {
      const url = new URL(this.store.networkContext.apiBaseUrl + route);
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key] as string),
      );
      const promise = fetch(url.toString()).then((response) => {
        if (!response.ok) throw new Error("Network request failed");
        return response.json();
      });
      statisticsCache.set(id + params.from + params.to, promise);
      result = await promise;
    }

    if (!isObject(result)) throw new Error("Response missing data property");

    if (!isArray(result))
      throw new Error("Invalid statistics data returned from API");

    return result;
  }

  async fetchStatistics<a extends Statistics>(
    id: string,
    from: Date,
    to: Date,
    route: string,
  ): Promise<a[]> {
    const stats = await this.fetchStatisticsCached(id, from, to, route);
    stats.forEach((stat: unknown) => {
      if (!isObject(stat)) throw new Error("Invalid statistics");
      if (typeof stat.time === "string") stat.time = new Date(stat.time);
    }); //todo: handle in fromJson domain object

    return stats as a[];
  }
}
