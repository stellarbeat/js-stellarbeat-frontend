import init, {fbas_analysis}  from "@stellarbeat/stellar_analysis_temp";
import {Node, Organization} from '@stellarbeat/js-stellar-domain';

const ctx: Worker = self as any;
let initialized: boolean = false;

ctx.addEventListener('message', (event) => {
    const nodes = event.data.nodes;
    const organizations = event.data.organizations;
    const merge = event.data.merge;

    if(!initialized){
        init('stellar_analysis_bg.wasm').then(instance => {
            performAnalysis(nodes, organizations);
            initialized = true;
        })
    } else {
        performAnalysis(nodes, organizations);
    }

});

function performAnalysis(nodes:Node[], organizations: Organization[]) {
    const nodesAnalysis = fbas_analysis(JSON.stringify(nodes), JSON.stringify(organizations), false);
    const organizationAnalysis = fbas_analysis(JSON.stringify(nodes), JSON.stringify(organizations), true);
    ctx.postMessage({type: 'end', result: {nodesAnalysis: nodesAnalysis, organizationAnalysis: organizationAnalysis}});
}

export default ctx;
