import { reactive } from "vue";

class FederatedVotingStore {
  scenarios: string[] = ["FBAS QI scenario"];
  selectedScenario: string = this.scenarios[0];
}

export const federatedVotingStore = reactive<FederatedVotingStore>(
  new FederatedVotingStore()
);
