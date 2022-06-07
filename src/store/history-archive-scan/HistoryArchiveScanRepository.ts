import { HistoryArchiveScan } from "@stellarbeat/js-stellar-domain";

export interface HistoryArchiveScanRepository {
  findLatest(url: string): Promise<HistoryArchiveScan | null>;
}
