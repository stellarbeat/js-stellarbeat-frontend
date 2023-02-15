import Store from "@/store/Store";
import { UnwrapRef, reactive } from "vue";
import useStore from "@/store/useStore";
import StatisticsStore from "@/store/StatisticsStore";

const store = useStore();

let measurementsStore: StatisticsStore | null = null;
export default function (): StatisticsStore {
  if (measurementsStore === null)
    measurementsStore = new StatisticsStore(store);

  return measurementsStore;
}
