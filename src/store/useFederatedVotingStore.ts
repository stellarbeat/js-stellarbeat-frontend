import { reactive, ref, type Ref } from "vue";
import { Network } from "@stellarbeat/js-stellarbeat-shared";
import { FBASQIRepository } from "@/repositories/implementation/FBASQIRepository";

class FederatedVotingStore {
  scenarios: string[] = ["FBAS QI scenario"];
  selectedScenario: string = this.scenarios[0];
  network: Network = new Network([]);
  selectedNodeId: string | null = null;

  overlayGraphRepellingForce: Ref<number> = ref(1000);

  constructor() {
    this.getNetwork().then((network: Network) => {
      this.network = network;
    });
  }

  private getNetwork = async () => {
    const networkRepository = new FBASQIRepository();
    const networkOrError = await networkRepository.find();
    if (networkOrError.isErr()) {
      return new Network([]);
    }

    return networkOrError.value;
  };
}

export const federatedVotingStore = reactive<FederatedVotingStore>(
  new FederatedVotingStore(),
);
