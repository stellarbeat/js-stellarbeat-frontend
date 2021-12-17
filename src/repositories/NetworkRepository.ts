import { Network } from "@stellarbeat/js-stellar-domain";
import { Result } from "neverthrow";

export interface NetworkRepository {
  find(at?: Date): Promise<Result<Network, Error>>;
}
