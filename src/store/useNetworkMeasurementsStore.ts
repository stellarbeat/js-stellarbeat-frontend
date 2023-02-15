import useMeasurementsStore from "@/store/useMeasurementsStore";
import NetworkStatisticsStore from "@/store/NetworkStatisticsStore";

const measurementsStore = useMeasurementsStore();

let networkMeasurementsStore: NetworkStatisticsStore | null = null;
export default function (): NetworkStatisticsStore {
  if (networkMeasurementsStore === null)
    networkMeasurementsStore = new NetworkStatisticsStore(measurementsStore);

  return networkMeasurementsStore;
}
