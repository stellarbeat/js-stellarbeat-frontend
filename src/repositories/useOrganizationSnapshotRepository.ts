import useStore from "@/store/useStore";
import { OrganizationSnapshotRepository } from "@/repositories/OrganizationSnapshotRepository";

const store = useStore();

let repo: OrganizationSnapshotRepository | null = null;
export default function (): OrganizationSnapshotRepository {
  if (repo !== null && repo.apiBaseUrl === store.networkContext.apiBaseUrl)
    return repo;

  const apiBaseUrl = store.networkContext.apiBaseUrl;
  if (!apiBaseUrl) throw new Error("apiBaseUrl is not set");

  repo = new OrganizationSnapshotRepository(apiBaseUrl);

  return repo;
}
