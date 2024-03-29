import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  Simulation,
  SimulationNodeDatum,
} from "d3-force";
import {
  LinkDatum,
  NodeDatum,
} from "@/components/federated-voting/GraphManager";

export class SimulationManager {
  private simulation: Simulation<NodeDatum, LinkDatum> | null = null;

  constructor(
    private nodes: NodeDatum[],
    private links: LinkDatum[],
    private repellingForce: number,
    private width: number,
    private height: number,
  ) {
    this.createSimulation();
  }

  private createSimulation() {
    this.simulation = forceSimulation(this.nodes)
      .force("link", this.getLinkForce())
      .force("charge", this.getCharge())
      .force("center", forceCenter(this.width / 2, this.height / 2));
  }

  private getCharge() {
    return forceManyBody().strength(() => -this.repellingForce);
  }

  private getLinkForce() {
    return forceLink(this.links).id(
      (d: SimulationNodeDatum) => (d as NodeDatum).id,
    );
  }

  public updateSimulationForce(force: number) {
    this.repellingForce = force;
    if (this.simulation) {
      this.simulation.force("charge", this.getCharge());
      this.simulation.alpha(0.5).restart();
    }
  }

  public updateSimulationLinks(links: LinkDatum[]) {
    this.links = links;
    if (this.simulation) {
      this.simulation.force("link", this.getLinkForce());
      this.simulation.alpha(0.5).restart();
    }
  }
}
