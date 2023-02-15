import Store from "@/store/Store";
import { UnwrapRef, reactive } from "vue";
import useStore from "@/store/useStore";
import StatisticsStore from "@/store/StatisticsStore";
import NodeStatisticsStore from "@/store/NodeStatisticsStore";
import useMeasurementsStore from "@/store/useMeasurementsStore";

const measurementsStore = useMeasurementsStore();

let nodeMeasurementsStore: NodeStatisticsStore | null = null;
export default function (): NodeStatisticsStore {
  if (nodeMeasurementsStore === null)
    nodeMeasurementsStore = new NodeStatisticsStore(measurementsStore);

  return nodeMeasurementsStore;
}
