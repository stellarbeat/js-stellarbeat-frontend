import { HistoryArchiveScanRepository } from "@/repositories/HistoryArchiveScanRepository";
import { HistoryArchiveScan } from "@stellarbeat/js-stellarbeat-shared";
import axios from "axios";

export class RESTHistoryArchiveScanRepository
  implements HistoryArchiveScanRepository
{
  constructor(private readonly baseApiUrl: string) {}

  get apiBaseUrl(): string {
    return this.baseApiUrl;
  }

  async findLatest(url: string): Promise<HistoryArchiveScan | null> {
    try {
      const result = await axios.get(
        this.baseApiUrl + "/v1/history-scan/" + encodeURIComponent(url)
      );

      if (result.status === 200 && result.data) {
        return HistoryArchiveScan.fromHistoryArchiveScanV1(result.data);
      }

      return null;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
