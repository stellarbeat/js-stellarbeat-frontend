import {
    haltingAnalysis
} from "@stellar/halting-analysis";

const ctx: Worker = self as any;

ctx.addEventListener('message', (event) => {
    const networkGraphNodes = event.data.networkGraphNodes;
    const numberOfNodeFailures = event.data.numberOfNodeFailures;

    let failures = haltingAnalysis(networkGraphNodes, numberOfNodeFailures).map(failure => failure.vulnerableNodes.map(node => node.node));

    ctx.postMessage({type: 'end', failures: failures});
});

export default ctx;
