import { HistoryArchiveScan } from "@stellarbeat/js-stellarbeat-shared";

export interface HistoryArchiveScanRepository {
  findLatest(url: string): Promise<HistoryArchiveScan | null>;
}
