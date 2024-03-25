import { err, ok, Result } from "neverthrow";
import { NodeSnapShot } from "@stellarbeat/js-stellarbeat-shared/lib/node-snap-shot";

export class NodeSnapshotRepository {
  constructor(public readonly apiBaseUrl: string) {}

  async find(at: Date): Promise<Result<NodeSnapShot[], Error>> {
    try {
      const params: Record<string, unknown> = {};
      params["at"] = at;
      const url = new URL(this.apiBaseUrl + "/v1/node-snapshots");
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key] as string),
      );
      const response = await fetch(url.toString());
      if (!response.ok) return err(new Error("Network request failed"));
      const data = await response.json();
      if (!data) return err(new Error("No data property in result"));
      if (!Array.isArray(data)) return err(new Error("Data is not an array"));

      return ok(data.map((item) => NodeSnapShot.fromNodeSnapshotV1(item)));
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
      const url = new URL(
        this.apiBaseUrl + "/v1/node/" + publicKey + "/snapshots",
      );
      Object.keys(params).forEach((key) =>
        url.searchParams.append(key, params[key] as string),
      );
      const response = await fetch(url.toString());
      if (!response.ok) return err(new Error("Network request failed"));
      const data = await response.json();
      if (!data) return err(new Error("No data property in result"));
      if (!Array.isArray(data)) return err(new Error("Data is not an array"));

      return ok(data.map((item) => NodeSnapShot.fromNodeSnapshotV1(item)));
    } catch (error) {
      if (error instanceof Error) return err(error);
      return err(new Error("Error fetching NodeSnapshots"));
    }
  }
}
