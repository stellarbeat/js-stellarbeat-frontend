import { reactive } from "vue";

class UseFederatedVotingStore {
  scenarios: string[] = ["FBAS QI scenario"];
  selectedScenario: string = this.scenarios[0];
}

export const federatedVotingStore = reactive<UseFederatedVotingStore>(
  new UseFederatedVotingStore()
);
