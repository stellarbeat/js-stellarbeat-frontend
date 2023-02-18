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
