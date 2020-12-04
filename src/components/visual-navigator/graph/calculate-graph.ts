import {forceLink, forceManyBody, forceSimulation, forceX, forceY} from 'd3-force';
import {Edge} from '@stellarbeat/js-stellar-domain/lib/graph/directed-graph';
import ViewEdge from '@/components/visual-navigator/graph/view-edge';

export default function (vertices: any, edges: any) {
    const transEdgesSize = vertices.filter((edge:ViewEdge) => edge.isPartOfTransitiveQuorumSet).length;

    const simulation = forceSimulation(vertices)
        .force('charge', forceManyBody().strength((d) => {
            return -250;
        }))
        .force('link', forceLink(edges).strength( (edge: any) => {
            if (edge.isPartOfTransitiveQuorumSet) {
                return 1/transEdgesSize * 0.2;
            }
            else if (edge.isPartOfStronglyConnectedComponent) {
                return 0.1;
            } else {
                return 0.000001;
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

    return {
        edges: edges,
        vertices: vertices
    }
}
