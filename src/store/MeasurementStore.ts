import axios from 'axios';

export interface DayMeasurement {
    day: Date
    crawlCount: number;
}

export interface Measurement {
    time: Date
}

type route = string;
type parametersKey = string
export default class MeasurementStore {
    protected measurementsCache: Map<route, Map<parametersKey, Promise<any>>> = new Map();

    protected async fetchMeasurements(id: string, from: Date, to: Date, route: string) {
        let measurementCache = this.measurementsCache.get(route);
        if(!measurementCache) {
            measurementCache = new Map();
            this.measurementsCache.set(route, measurementCache);
        }

        let params: any = {};
        params.from = from.toISOString();
        params.to = to.toISOString();
        let result;
        if (measurementCache.get(id + params.from + params.to))
            result = await measurementCache.get(id + params.from + params.to); //multiple charts can request the same endpoint at the same time.
        else {
            let promise = axios.get(process.env.VUE_APP_API_URL + route, {
                params
            });
            measurementCache.set(id + params.from + params.to, promise);
            result = await promise;
        }

        return result.data;
    }

    async fetchDayMeasurements<a extends DayMeasurement>(id: string, from: Date, to: Date, route: string): Promise<a[]> {
        let measurements = await this.fetchMeasurements(id, from, to, route);
        measurements.forEach((measurement: any) => measurement.day = new Date(measurement.day));

        return measurements;
    }

    async fetchIndividualMeasurements<a extends Measurement>(id: string, from: Date, to: Date, route: string): Promise<a[]> {
        let measurements = await this.fetchMeasurements(id, from, to, route);
        measurements.forEach((measurement: any) => measurement.time = new Date(measurement.time));

        return measurements;
    }
}
