import { err, ok, Result } from "neverthrow";
import axios from "axios";
import { NodeSnapShot } from "@stellarbeat/js-stellarbeat-shared/lib/node-snap-shot";

export class NodeSnapshotRepository {
  constructor(public readonly apiBaseUrl: string) {}

  async find(at: Date): Promise<Result<NodeSnapShot[], Error>> {
    try {
      const params: Record<string, unknown> = {};
      params["at"] = at;
      const result = await axios.get(this.apiBaseUrl + "/v1/node-snapshots", {
        params,
      });
      if (!result.data) return err(new Error("No data property in result"));
      if (!Array.isArray(result.data))
        return err(new Error("Data is not an array"));

      return ok(
        result.data.map((item) => NodeSnapShot.fromNodeSnapshotV1(item)),
      );
    } catch (error) {
      if (error instanceof Error) return err(error);
      return err(new Error("Error fetching NodeSnapShots"));
    }
  }

  async findForNode(
    publicKey: string,
    at: Date,
  ): Promise<Result<NodeSnapShot[], Error>> {
    try {
      const params: Record<string, unknown> = {};
      params["at"] = at;
      const result = await axios.get(
        this.apiBaseUrl + "/v1/node/" + publicKey + "/snapshots",
        { params },
      );
      if (!result.data) return err(new Error("No data property in result"));
      if (!Array.isArray(result.data))
        return err(new Error("Data is not an array"));

      return ok(
        result.data.map((item) => NodeSnapShot.fromNodeSnapshotV1(item)),
      );
    } catch (error) {
      if (error instanceof Error) return err(error);
      return err(new Error("Error fetching NodeSnapshots"));
    }
  }
}
