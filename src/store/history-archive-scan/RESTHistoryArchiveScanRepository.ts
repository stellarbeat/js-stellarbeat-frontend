import { HistoryArchiveScanRepository } from "@/store/history-archive-scan/HistoryArchiveScanRepository";
import { HistoryArchiveScan } from "@stellarbeat/js-stellarbeat-shared";
import axios from "axios";

export class RESTHistoryArchiveScanRepository
  implements HistoryArchiveScanRepository
{
  constructor(private baseApiUrl: string) {}

  async findLatest(url: string): Promise<HistoryArchiveScan | null> {
    try {
      const result = await axios.get(
        this.baseApiUrl + "/v1/history-scan/" + encodeURIComponent(url)
      );

      if (result.status === 200 && result.data) {
        return HistoryArchiveScan.fromJSON(result.data);
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
