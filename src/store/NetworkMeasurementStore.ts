import MeasurementStore, {AggregationMeasurement, Measurement} from '@/store/MeasurementStore';

export interface NetworkAggregationMeasurement extends AggregationMeasurement {
    nrOfActiveWatchersSum: number;
    nrOfActiveValidatorsSum: number;
    nrOfActiveFullValidatorsSum: number;
    nrOfActiveOrganizationsSum: number;
    transitiveQuorumSetSizeSum: number;
    hasQuorumIntersectionCount: boolean;
    hasQuorumIntersectionFilteredCount: boolean;
    minBlockingSetSizeMin: number;
    minBlockingSetFilteredSizeMin: number;
    minBlockingSetOrgsSizeMin: number;
    minBlockingSetOrgsFilteredSizeMin: number;
    minSplittingSetSizeMin: number;
    minSplittingSetFilteredSizeMin: number;
    minSplittingSetOrgsSizeMin: number;
    minSplittingSetOrgsFilteredSizeMin: number;
    topTierSizeMin: number;
    topTierFilteredSizeMin: number;
    topTierOrgsSizeMin: number;
    topTierOrgsFilteredSizeMin: number;
    minBlockingSetSizeMax: number;
    minBlockingSetFilteredSizeMaw: number;
    minBlockingSetOrgsSizeMax: number;
    minBlockingSetOrgsFilteredSizeMax: number;
    minSplittingSetSizeMax: number;
    minSplittingSetFilteredSizeMax: number;
    minSplittingSetOrgsSizeMax: number;
    minSplittingSetOrgsFilteredSizeMax: number;
    topTierSizeMax: number;
    topTierFilteredSizeMax: number;
    topTierOrgsSizeMax: number;
    topTierOrgsFilteredSizeMax: number;
}

export interface NetworkMeasurement extends Measurement {
    nrOfActiveWatchers: number;
    nrOfActiveValidators: number;
    nrOfActiveFullValidators: number;
    nrOfActiveOrganizations: number;
    transitiveQuorumSetSize: number;
    hasQuorumIntersection: boolean;
    hasQuorumIntersectionFiltered: boolean;
    minBlockingSetSize: number;
    minBlockingSetFilteredSize: number;
    minBlockingSetOrgsSize: number;
    minBlockingSetOrgsFilteredSize: number;
    minSplittingSetSize: number;
    minSplittingSetFilteredSize: number;
    minSplittingSetOrgsSize: number;
    minSplittingSetOrgsFilteredSize: number;
    topTierSize: number;
    topTierFilteredSize: number;
    topTierOrgsSize: number;
    topTierOrgsFilteredSize: number;
}

export default class OrganizationMeasurementStore {

    protected measurementStore: MeasurementStore;

    constructor(measurementStore: MeasurementStore) {
        this.measurementStore = measurementStore;
    }

    async getMonthMeasurements(networkId: string, from: Date, to: Date): Promise<NetworkAggregationMeasurement[]> {
        return await this.measurementStore.fetchAggregationMeasurement<NetworkAggregationMeasurement>(networkId, from, to, '/v1/network/' + networkId + '/month-measurements');
    }

    async getDayMeasurements(networkId: string, from: Date, to: Date): Promise<NetworkAggregationMeasurement[]> {
        return await this.measurementStore.fetchAggregationMeasurement<NetworkAggregationMeasurement>(networkId, from, to, '/v1/network/' + networkId + '/day-measurements');
    }

    async getMeasurements(networkId: string, from: Date, to: Date): Promise<NetworkMeasurement[]> {
        return await this.measurementStore.fetchIndividualMeasurements<NetworkMeasurement>(networkId, from, to, '/v1/network/' + networkId + '/measurements');
    }
}