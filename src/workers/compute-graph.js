const d3 = require("d3");

module.exports = function (self) {
    self.addEventListener('message', (event) => {
        let nodes = event.data.nodes;
        let links = event.data.links;

        let simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(d => {
                return -25;
            }))
            .force('link', d3.forceLink(links).strength(function (link) {
                if (link.isClusterLink) {
                    return 0.05;
                } else {
                    return 0.001;
                }
            }).id(function (d) {
                return d.publicKey; //can't use getters? webworkers?
            }))
            .force('x', d3.forceX())
            .force('y', d3.forceY())
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
};
/*module.exports = function (self) {
    self.addEventListener('message', (event) => {
        console.log("in worker");
        self.postMessage("hello from worker");
    });
};*/
