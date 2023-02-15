import Store from "@/store/Store";
import { UnwrapRef, reactive } from "vue";

let store: Store | null = null;
export default function (): Store {
  if (store === null) store = new Store();

  return store;
}
