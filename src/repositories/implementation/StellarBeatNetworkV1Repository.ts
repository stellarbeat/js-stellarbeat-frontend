import { Network } from "@stellarbeat/js-stellarbeat-shared";
import axios from "axios";
import { err, ok, Result } from "neverthrow";
import { NetworkRepository } from "@/repositories/NetworkRepository";

//repository to connect to stellarbeat api to fetch networks
export class StellarBeatNetworkV1Repository implements NetworkRepository {
  constructor(protected apiBaseUrl: string) {}

  async find(at?: Date): Promise<Result<Network, Error>> {
    try {
      const params: Record<string, unknown> = {};
      if (at) {
        params["at"] = at.toISOString();
      }

      const result = await axios.get(this.apiBaseUrl + "/v1", {
        params,
      });
      if (result.data) {
        return ok(Network.fromJSON(result.data));
      }

      return err(new Error("No data property in result"));
    } catch (error) {
      console.log(error);
      if (error instanceof Error) return err(error);
      return err(new Error("Error fetching network"));
    }
  }
}
