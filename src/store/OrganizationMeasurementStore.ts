import MeasurementStore, {DayMeasurement, Measurement} from '@/store/MeasurementStore';

export interface OrganizationDayMeasurement extends DayMeasurement{
    day: Date
    isSubQuorumAvailableCount: number;
    crawlCount: number;
}

export interface OrganizationMeasurement extends Measurement{
    time: Date
    isSubQuorumAvailable: boolean;
}

export default class OrganizationMeasurementStore {

    protected measurementStore: MeasurementStore;

    constructor(measurementStore: MeasurementStore) {
        this.measurementStore = measurementStore;
    }


    async getDayMeasurements(organizationId: string, from: Date, to: Date): Promise<OrganizationDayMeasurement[]> {
        return await this.measurementStore.fetchDayMeasurements<OrganizationDayMeasurement>(organizationId, from, to, '/v2/organization-day-measurements');
    }

    async getMeasurements(organizationId: string, from: Date, to: Date): Promise<OrganizationMeasurement[]> {
        return await this.measurementStore.fetchIndividualMeasurements<OrganizationMeasurement>(organizationId, from, to, '/v2/organization-measurements');
    }
}