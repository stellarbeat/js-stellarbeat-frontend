import {forceManyBody, forceSimulation, forceLink, forceX, forceY} from 'd3-force';

const ctx: Worker = self as any;

ctx.addEventListener('message', (event) => {
    console.time("worker");
    const vertices = event.data.vertices;
    const edges = event.data.edges;
    const width = event.data.width;
    const height = event.data.height;
    //@ts-ignore
    const nrOfTransitiveVertices = event.data.vertices.filter(vertex => vertex.isPartOfTransitiveQuorumSet).length;

    const simulation = forceSimulation(vertices)
        .force('charge', forceManyBody().strength((d) => {
            return -250;
        }))
        .force('link', forceLink(edges).strength( (edge: any) => {
            if (edge.isPartOfTransitiveQuorumSet) {
                return 1/nrOfTransitiveVertices * 0.2;
            }
            else if (edge.isPartOfStronglyConnectedComponent) {
                return 0.1;
            } else {
                return 0.001113;
            }
        }).id( (d: any) => {
            return d.key;
        }))
        .force('x', forceX(0))
        .force('y', forceY(0))
        // .alphaDecay(0.1)
        // .alphaMin(0.15)
        // .velocityDecay(0.35);
        .stop();

    for (let i = 0,
             n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        //ctx.postMessage({type: 'tick', progress: i / n});
        simulation.tick();
    }
    console.timeEnd("worker");
    ctx.postMessage({type: 'end', vertices: vertices, edges: edges});
});

export default ctx;
