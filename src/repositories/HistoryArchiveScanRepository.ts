import { HistoryArchiveScan } from "@stellarbeat/js-stellarbeat-shared";

export interface HistoryArchiveScanRepository {
  get apiBaseUrl(): string;
  findLatest(url: string): Promise<HistoryArchiveScan | null>;
}
