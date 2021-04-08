import init, {fbas_analysis, init_panic_hook, MergeBy} from 'stellar_analysis';
import {Node, Organization, PublicKey} from '@stellarbeat/js-stellar-domain';

const ctx: Worker = self as any;
let initialized: boolean = false;

ctx.addEventListener('message', (event) => {
    const nodes = event.data.nodes;
    const failingNodePublicKeys = event.data.failingNodePublicKeys;
    const organizations = event.data.organizations;
    const mergeBy = event.data.mergeBy;

    if(!initialized){
        init('stellar_analysis_bg.wasm').then(instance => {
            init_panic_hook();
            performAnalysis(nodes, failingNodePublicKeys, organizations, mergeBy);
            initialized = true;
        }).catch(reason => console.log(reason));
    } else {
        performAnalysis(nodes, failingNodePublicKeys, organizations, mergeBy);
    }

});

function performAnalysis(nodes:Node[], failingNodePublicKeys:PublicKey[], organizations: Organization[], mergeBy:MergeBy) {
    const analysis = fbas_analysis(JSON.stringify(nodes), JSON.stringify(organizations),JSON.stringify(failingNodePublicKeys) , mergeBy);
    ctx.postMessage({type: 'end', result: {analysis: analysis, mergeBy: mergeBy}});
}

export default ctx;
