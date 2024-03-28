import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";

export interface NodeDatum extends SimulationNodeDatum {
  id: number;
  name: string;
}

export interface LinkDatum extends SimulationLinkDatum<NodeDatum> {
  source: NodeDatum;
  target: NodeDatum;
}

export class GraphManager {
  nodes: NodeDatum[];
  links: LinkDatum[] = [];

  constructor(nodes: NodeDatum[], topology: string) {
    this.nodes = nodes;
    this.updateGraphTopology(topology);
  }

  updateGraphTopology(topology: string) {
    // Clear the existing links

    const newLinks: LinkDatum[] = [];
    if (topology === "complete") {
      // Create a complete graph
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          newLinks.push({
            source: this.nodes[i],
            target: this.nodes[j],
          });
        }
      }
    } else if (topology === "random") {
      // Create a random graph
      const linkSet = new Set<string>();
      for (let i = 0; i < this.nodes.length; i++) {
        const numLinks = this.getRandomInt(1, this.nodes.length);
        for (let j = 0; j < numLinks; j++) {
          const targetIndex = this.getRandomInt(0, this.nodes.length);
          if (targetIndex !== i) {
            // Create a string representation of the link
            const linkString = [i, targetIndex].sort().join("-");
            // Only add the link if it doesn't already exist
            if (!linkSet.has(linkString)) {
              newLinks.push({
                source: this.nodes[i],
                target: this.nodes[targetIndex],
              });
              linkSet.add(linkString);
            }
          }
        }
      }
    } else if (topology === "ring") {
      // Create a ring graph
      for (let i = 0; i < this.nodes.length; i++) {
        newLinks.push({
          source: this.nodes[i],
          target: this.nodes[(i + 1) % this.nodes.length],
        });
      }
    }

    this.links = newLinks;
  }

  private getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }
}
