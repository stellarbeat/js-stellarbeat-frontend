import { err, ok, Result } from "neverthrow";
import { OrganizationSnapShot } from "@stellarbeat/js-stellarbeat-shared";
import axios from "axios";

export class OrganizationSnapshotRepository {
  constructor(private apiBaseUrl: string) {}

  async find(at: Date): Promise<Result<OrganizationSnapShot[], Error>> {
    try {
      const params: Record<string, unknown> = {};
      params["at"] = at;
      const result = await axios.get(
        this.apiBaseUrl + "/v1/organization-snapshots",
        { params }
      );
      if (!result.data) return err(new Error("No data property in result"));
      if (!Array.isArray(result.data))
        return err(new Error("Data is not an array"));

      return ok(
        result.data.map((item) =>
          OrganizationSnapShot.fromOrganizationSnapShotV1DTO(item)
        )
      );
    } catch (error) {
      console.log(error);
      if (error instanceof Error) return err(error);
      return err(new Error("Error fetching OrganizationSnapShots"));
    }
  }

  async findForOrganization(
    organizationId: string,
    at: Date
  ): Promise<Result<OrganizationSnapShot[], Error>> {
    try {
      const params: Record<string, unknown> = {};
      params["at"] = at;
      const result = await axios.get(
        this.apiBaseUrl + "/v1/organization/" + organizationId + "/snapshots",
        { params }
      );
      if (!result.data) return err(new Error("No data property in result"));
      if (!Array.isArray(result.data))
        return err(new Error("Data is not an array"));

      return ok(
        result.data.map((item) =>
          OrganizationSnapShot.fromOrganizationSnapShotV1DTO(item)
        )
      );
    } catch (error) {
      console.log(error);
      if (error instanceof Error) return err(error);
      return err(new Error("Error fetching OrganizationSnapShots"));
    }
  }
}
