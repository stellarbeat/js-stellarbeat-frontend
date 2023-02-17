import NodeStatisticsStore from "@/store/NodeStatisticsStore";
import useMeasurementsStore from "@/store/useMeasurementsStore";

const measurementsStore = useMeasurementsStore();

let nodeMeasurementsStore: NodeStatisticsStore | null = null;
export default function (): NodeStatisticsStore {
  if (nodeMeasurementsStore === null)
    nodeMeasurementsStore = new NodeStatisticsStore(measurementsStore);

  return nodeMeasurementsStore;
}
