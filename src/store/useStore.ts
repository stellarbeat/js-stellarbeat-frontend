import Store from "@/store/Store";
import { UnwrapRef, reactive } from "@vue/composition-api";

let store: UnwrapRef<Store> | null = null;
export default function (): Store {
  if (store === null) store = reactive(new Store());

  //@ts-ignore
  return store;
}
