import {
  forceManyBody,
  forceSimulation,
  forceLink,
  forceX,
  forceY,
} from "d3-force";
import ViewVertex from "@/components/visual-navigator/graph/view-vertex";

const ctx: Worker = self as any;

ctx.addEventListener("message", (event) => {
  const vertices = event.data.vertices;
  const edges = event.data.edges;
  //@ts-ignore
  const nrOfTransitiveVertices = event.data.vertices.filter(
    (vertex: ViewVertex) => vertex.isPartOfTransitiveQuorumSet
  ).length;

  const simulation = forceSimulation(vertices)
    .force(
      "charge",
      forceManyBody().strength(() => {
        return -250;
      })
    )
    .force(
      "link",
      forceLink(edges)
        .strength((edge: any) => {
          if (edge.isPartOfTransitiveQuorumSet) {
            return (1 / nrOfTransitiveVertices) * 0.17;
          } else if (edge.isPartOfStronglyConnectedComponent) {
            return 0.1;
          } else {
            return 0.001113;
          }
        })
        .id((d: any) => {
          return d.key;
        })
    )
    .force("x", forceX(0))
    .force("y", forceY(0))
    // .alphaDecay(0.1)
    // .alphaMin(0.15)
    // .velocityDecay(0.35);
    .stop();

  for (
    let i = 0,
      n = Math.ceil(
        Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())
      );
    i < n;
    ++i
  ) {
    //ctx.postMessage({type: 'tick', progress: i / n});
    simulation.tick();
  }
  ctx.postMessage({ type: "end", vertices: vertices, edges: edges });
});

export default ctx;
