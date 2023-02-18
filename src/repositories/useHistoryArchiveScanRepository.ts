import useStore from "@/store/useStore";
import { HistoryArchiveScanRepository } from "@/repositories/HistoryArchiveScanRepository";
import { RESTHistoryArchiveScanRepository } from "@/repositories/implementation/RESTHistoryArchiveScanRepository";

const store = useStore();

let repo: HistoryArchiveScanRepository | null = null;
export default function (): HistoryArchiveScanRepository {
  if (repo !== null) return repo;

  const apiBaseUrl = store.networkContext.apiBaseUrl;
  if (!apiBaseUrl) throw new Error("apiBaseUrl is not set");

  repo = new RESTHistoryArchiveScanRepository(apiBaseUrl);

  return repo;
}
