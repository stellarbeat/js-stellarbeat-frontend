import {forceManyBody, forceSimulation, forceLink, forceX, forceY} from 'd3-force';

addEventListener('message', (event) => {
        let nodes = event.data.nodes;
        let links = event.data.links;

        let simulation = forceSimulation(nodes)
            .force('charge', forceManyBody().strength(d => {
                return -120;
            }))
            .force('link', forceLink(links).strength(function (link) {
                if (link.isClusterLink) {
                    return 0.1;
                } else {
                    return 0.005;
                }
            }).id(function (d) {
                return d.publicKey;
            }))
            .force('x', forceX())
            .force('y', forceY())
            //.alphaDecay(0.1)
            //.alphaMin(0.15)
            //.velocityDecay(0.35);
            .stop();

        for (let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            self.postMessage({type: "tick", progress: i / n});
            simulation.tick();
        }

        self.postMessage({type: "end", nodes: nodes, links: links});
    });