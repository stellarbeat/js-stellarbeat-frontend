import MeasurementStore, {DayMeasurement, Measurement} from '@/store/MeasurementStore';

export interface NodeDayMeasurement extends DayMeasurement {
    day: Date
    isActiveCount: number;
    isValidatingCount: number;
    isFullValidatorCount: number;
    isOverloadedCount: number;
    indexSum: number;
    crawlCount: number;
}

export interface NodeMeasurement extends Measurement {
    time: Date
    isActive: boolean;
    isValidating: boolean;
    isFullValidator: boolean;
    isOverloaded: boolean;
    index: number;
}

export default class NodeMeasurementStore {

    protected measurementStore: MeasurementStore;

    constructor(measurementStore: MeasurementStore) {
        this.measurementStore = measurementStore;
    }

    async getDayMeasurements(id: string, from: Date, to: Date): Promise<NodeDayMeasurement[]> {
        return await this.measurementStore.fetchDayMeasurements<NodeDayMeasurement>(id, from, to, '/v1/nodes/' + id + '/day-measurements');
    }

    async getMeasurements(id: string, from: Date, to: Date): Promise<NodeMeasurement[]> {
        return await this.measurementStore.fetchIndividualMeasurements<NodeMeasurement>(id, from, to, '/v1/nodes/' + id + '/measurements');
    }
}
