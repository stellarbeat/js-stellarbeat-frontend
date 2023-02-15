import Store from "@/store/Store";
import { UnwrapRef, reactive } from "vue";
import useStore from "@/store/useStore";
import StatisticsStore from "@/store/StatisticsStore";
import NodeStatisticsStore from "@/store/NodeStatisticsStore";
import useMeasurementsStore from "@/store/useMeasurementsStore";
import OrganizationStatisticsStore from "@/store/OrganizationStatisticsStore";

const measurementsStore = useMeasurementsStore();

let organizationMeasurementsStore: OrganizationStatisticsStore | null = null;
export default function (): OrganizationStatisticsStore {
  if (organizationMeasurementsStore === null)
    organizationMeasurementsStore = new OrganizationStatisticsStore(
      measurementsStore
    );

  return organizationMeasurementsStore;
}
