import useStore from "@/store/useStore";
import { NodeSnapshotRepository } from "@/repositories/NodeSnapshotRepository";

const store = useStore();

let repo: NodeSnapshotRepository | null = null;
export default function (): NodeSnapshotRepository {
  if (repo !== null && repo.apiBaseUrl === store.networkContext.apiBaseUrl) {
    return repo;
  }

  const apiBaseUrl = store.networkContext.apiBaseUrl;
  if (!apiBaseUrl) throw new Error("apiBaseUrl is not set");

  repo = new NodeSnapshotRepository(apiBaseUrl);

  return repo;
}
