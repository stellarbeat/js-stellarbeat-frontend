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
      .force("center", forceCenter(this.width / 2, this.height / 2))
      .force("boundingBox", () => this.boundingBoxForce()) //nodes don't go out of bounds
      .alphaMin(0.1); // stops the simulation when alpha reaches 0.1
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
      this.simulation.alpha(0.8).restart();
    }
  }

  public updateSimulationLinks(links: LinkDatum[]) {
    this.links = links;
    if (this.simulation) {
      this.simulation.force("link", this.getLinkForce());
      this.simulation.alpha(0.8).restart();
    }
  }

  private boundingBoxForce() {
    for (const node of this.nodes) {
      node.x = Math.max(8, Math.min(this.width - 8, node.x ?? 0));
      node.y = Math.max(8, Math.min(this.height - 8, node.y ?? 0));
    }
  }
}
