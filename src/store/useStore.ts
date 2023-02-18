import Store from "@/store/Store";

let store: Store | null = null;
export default function (): Store {
  if (store === null) store = new Store();

  return store;
}
