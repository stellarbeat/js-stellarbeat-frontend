import axios, { AxiosResponse } from "axios";
import Store from "@/store/Store";
import {
  isArray,
  isObject,
} from "@stellarbeat/js-stellar-domain/lib/typeguards";

export interface StatisticsAggregation {
  crawlCount: number;
}

export interface Statistics {
  time: Date;
}

type route = string;
type parametersKey = string;
export default class StatisticsStore {
  protected statisticsCache: Map<
    route,
    Map<parametersKey, Promise<AxiosResponse<unknown>>>
  > = new Map();
  protected store: Store;

  public constructor(store: Store) {
    this.store = store;
  }

  protected async fetchStatisticsCached(
    id: string,
    from: Date,
    to: Date,
    route: string
  ): Promise<unknown[]> {
    let statisticsCache = this.statisticsCache.get(
      this.store.getApiUrl() + route
    );
    if (!statisticsCache) {
      statisticsCache = new Map();
      this.statisticsCache.set(this.store.getApiUrl() + route, statisticsCache);
    }

    const params: Record<string, unknown> = {};
    params.from = from.toISOString();
    params.to = to.toISOString();
    let result;
    if (statisticsCache.get(id + params.from + params.to))
      result = await statisticsCache.get(id + params.from + params.to);
    //multiple charts can request the same endpoint at the same time.
    else {
      const promise = axios.get(this.store.getApiUrl() + route, {
        params,
      });
      statisticsCache.set(id + params.from + params.to, promise);
      result = await promise;
    }

    if (!isObject(result) || !result.data)
      throw new Error("Response missing data property");

    if (!isArray(result.data))
      throw new Error("Invalid statistics data returned from API");

    return result.data;
  }

  async fetchStatistics<a extends Statistics>(
    id: string,
    from: Date,
    to: Date,
    route: string
  ): Promise<a[]> {
    const stats = await this.fetchStatisticsCached(id, from, to, route);
    stats.forEach((stat: unknown) => {
      if (!isObject(stat)) throw new Error("Invalid statistics");
      if (typeof stat.time === "string") stat.time = new Date(stat.time);
    }); //todo: handle in fromJson domain object

    return stats as a[];
  }
}
