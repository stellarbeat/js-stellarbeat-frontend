import { HistoryArchiveScanRepository } from "@/store/history-archive-scan/HistoryArchiveScanRepository";
import { HistoryArchiveScan } from "@stellarbeat/js-stellar-domain";
import axios from "axios";

export class RESTHistoryArchiveScanRepository
  implements HistoryArchiveScanRepository
{
  constructor(private baseApiUrl: string) {}

  async findLatest(url: string): Promise<HistoryArchiveScan | null> {
    const result = await axios.get(
      this.baseApiUrl + "/v1/history-scan/" + encodeURIComponent(url)
    );

    if (result.data) {
      return HistoryArchiveScan.fromJSON(result.data);
    }

    return null;
  }
}
