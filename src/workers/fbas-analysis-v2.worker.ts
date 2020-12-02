import init, {fbas_analysis, init_panic_hook}  from "stellar_analysis";
import {Node, Organization, PublicKey} from '@stellarbeat/js-stellar-domain';

const ctx: Worker = self as any;
let initialized: boolean = false;

ctx.addEventListener('message', (event) => {
    const nodes = event.data.nodes;
    const failingNodePublicKeys = event.data.failingNodePublicKeys;
    const organizations = event.data.organizations;
    const merge = event.data.mergeByOrganizations;

    if(!initialized){
        init('stellar_analysis_bg.wasm').then(instance => {
            init_panic_hook();
            performAnalysis(nodes, failingNodePublicKeys, organizations, merge);
            initialized = true;
        }).catch(reason => console.log(reason));
    } else {
        performAnalysis(nodes, failingNodePublicKeys, organizations, merge);
    }

});

function performAnalysis(nodes:Node[], failingNodePublicKeys:PublicKey[], organizations: Organization[], merge:boolean) {
    const organizationAnalysis = fbas_analysis(JSON.stringify(nodes), JSON.stringify(organizations),JSON.stringify(failingNodePublicKeys) , true);
    if(!merge){
        const nodesAnalysis = fbas_analysis(JSON.stringify(nodes), JSON.stringify(organizations),JSON.stringify(failingNodePublicKeys), false);
        ctx.postMessage({type: 'end', result: {nodesAnalysis: nodesAnalysis, organizationAnalysis: organizationAnalysis, merged: false}});
    } else
        ctx.postMessage({type: 'end', result: {organizationAnalysis: organizationAnalysis, merged: true}});
}

export default ctx;
