import init, {fbas_analysis, init_panic_hook}  from "@stellarbeat/stellar_analysis_temp";
import {Node, Organization} from '@stellarbeat/js-stellar-domain';

const ctx: Worker = self as any;
let initialized: boolean = false;

ctx.addEventListener('message', (event) => {
    const nodes = event.data.nodes;
    const organizations = event.data.organizations;
    const merge = event.data.mergeByOrganizations;

    if(!initialized){
        init('stellar_analysis_bg.wasm').then(instance => {
            init_panic_hook();
            performAnalysis(nodes, organizations, merge);
            initialized = true;
        })
    } else {
        performAnalysis(nodes, organizations, merge);
    }

});

function performAnalysis(nodes:Node[], organizations: Organization[], merge:boolean) {
    const organizationAnalysis = fbas_analysis(JSON.stringify(nodes), JSON.stringify(organizations),JSON.stringify([]) , true);
    if(!merge){
        const nodesAnalysis = fbas_analysis(JSON.stringify(nodes), JSON.stringify(organizations),JSON.stringify([]), false);
        ctx.postMessage({type: 'end', result: {nodesAnalysis: nodesAnalysis, organizationAnalysis: organizationAnalysis, merged: false}});
    } else
        ctx.postMessage({type: 'end', result: {organizationAnalysis: organizationAnalysis, merged: true}});
}

export default ctx;
