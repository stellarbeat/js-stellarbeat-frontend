import { HistoryArchiveScanRepository } from "@/repositories/HistoryArchiveScanRepository";
import { HistoryArchiveScan } from "@stellarbeat/js-stellarbeat-shared";

export class RESTHistoryArchiveScanRepository
  implements HistoryArchiveScanRepository
{
  constructor(private readonly baseApiUrl: string) {}

  get apiBaseUrl(): string {
    return this.baseApiUrl;
  }

  async findLatest(url: string): Promise<HistoryArchiveScan | null> {
    try {
      const response = await fetch(
        this.baseApiUrl + "/v1/history-scan/" + encodeURIComponent(url),
      );

      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          return HistoryArchiveScan.fromHistoryArchiveScanV1(data);
        }
      }

      return null;
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "404") {
        return null;
      }
      throw error;
    }
  }
}
