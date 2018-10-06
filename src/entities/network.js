//@flow
const Node = require('./node');
const QuorumSet = require('./quorum-set');
const QuorumService = require('./../services/quorum');

class Network {
    _nodes: Array<Node>;
    _links: Array<Object>; //todo class?
    _publicKeyToNodesMap: Map<string, Node>;
    _failingNodes: Array<Node>;
    _reverseNodeDependencyMap: Map<string, Array<Node>>;
    _clusters: Set<string>;

    constructor(nodes: Array<Node>) {
        this._nodes = nodes;
        this._publicKeyToNodesMap = QuorumService.getPublicKeyToNodeMap(nodes);
        this.createNodesForUnknownValidators();
        this.initializeReverseNodeDependencyMap();
        this.computeFailingNodes();
        this.detectClusters();
        this.createLinks();
    }

    computeQuorumIntersection()
    {
        QuorumService.hasQuorumIntersection(
            this._nodes,
            this._clusters,
            this._publicKeyToNodesMap
        )
    }

    updateNetwork(nodes: ?Array<Node>)
    {
        if(nodes){
            this._nodes = nodes;
            this._publicKeyToNodesMap = QuorumService.getPublicKeyToNodeMap(nodes);
            this.createNodesForUnknownValidators();
        }
        this.initializeReverseNodeDependencyMap();
        this.computeFailingNodes();
        this.createLinks();
    }

    detectClusters() {
        this._clusters = QuorumService.getAllClusters(this.nodes.filter(node => node.active && node.quorumSet.hasValidators()), this._publicKeyToNodesMap);
        //let clusterLeafs = QuorumService.getAllClusterLeafs(clusters, this._publicKeyToNodesMap);
    }



    get links(){
        return this._links;
    }

    get failingNodes(){
        return this._failingNodes;
    }

    isNodeFailing(node: Node) {
        return this._failingNodes.includes(node);
    }

    isQuorumSetFailing(quorumSet: QuorumSet) {
        return !this.quorumSetCanReachThreshold(quorumSet, this._failingNodes);
    }

    createLinks(){
        this._links = this._nodes
            .filter(node => node.active && !this._failingNodes.includes(node))
            .map(node => {
            return QuorumSet.getAllValidators(node.quorumSet)
                .filter(validator => this._publicKeyToNodesMap.get(validator).active && !this._failingNodes.includes(this._publicKeyToNodesMap.get(validator))  )
                .map(validator => {
                return {
                    'source': node,
                    'target': this._publicKeyToNodesMap.get(validator),
                    'isClusterLink': this.isClusterLink(node.publicKey, validator)/*,
                    'active': this._publicKeyToNodesMap.get(validator).active
                    && this._publicKeyToNodesMap.get(node.publicKey).active
                    && !this._failingNodes.includes(this._publicKeyToNodesMap.get(validator))
                    && !this._failingNodes.includes(node)*/
                };
            })
        }).flatten()
    }

    isClusterLink(source, target){
        return Array.from(this._clusters).filter(cluster => cluster.has(source) && cluster.has(target)).length > 0;
    }

    createNodesForUnknownValidators() {
        this._nodes.forEach(node => {
            QuorumSet.getAllValidators(node.quorumSet).forEach(validator => {
                if (!this._publicKeyToNodesMap.has(validator)) {
                    let missingNode = new Node();
                    missingNode.publicKey = validator;
                    this.nodes.push(missingNode);
                    this._publicKeyToNodesMap.set(validator, missingNode);
                }
            })
        });
    }

    initializeReverseNodeDependencyMap() {
        this._reverseNodeDependencyMap = new Map();
        this.nodes.forEach(node => {
            QuorumSet.getAllValidators(node.quorumSet).forEach(validator => {
                if (!this._reverseNodeDependencyMap.has(validator)) {
                    this._reverseNodeDependencyMap.set(validator, [])
                }
                this._reverseNodeDependencyMap.get(validator).push(node);
            })
        });
    }

    get nodes(): Array<Node> {
        return this._nodes;
    }

    getNodeByPublicKey(publicKey): Node {
        return this._publicKeyToNodesMap.get(publicKey)
    }


    computeFailingNodes() {
        console.log('calculating failed nodes');
        let failingNodes = [];
        let nodesToCheck = this._nodes.filter(node => node.active && node.quorumSet.hasValidators()); //check all active nodes
        while (nodesToCheck.length > 0) {
            let nodeToCheck = nodesToCheck.pop();

            if (failingNodes.includes(nodeToCheck)) {
                continue; //already failing
            }

            if (this.quorumSetCanReachThreshold(nodeToCheck.quorumSet, failingNodes)) {
                continue; //working as expected
            }

            //node is failing
            failingNodes.push(nodeToCheck);

            //recheck all nodes that are dependant on it
            if (!this._reverseNodeDependencyMap.has(nodeToCheck.publicKey)) {
                continue //no nodes are dependant on it
            }

            this._reverseNodeDependencyMap.get(nodeToCheck.publicKey).forEach(node => {
                if(node.active && node.quorumSet.hasValidators())
                    nodesToCheck.push(node);
            })
        }

        this._failingNodes=failingNodes;
    }

    quorumSetCanReachThreshold(quorumSet, failingNodes) { //
        let counter = quorumSet.validators.filter(validator => {
            if (!this._publicKeyToNodesMap.has(validator)) {
                return false;
            }

            if(failingNodes.includes(this._publicKeyToNodesMap.get(validator))){
                return false;
            }

            return this._publicKeyToNodesMap.get(validator).active;
        }).length;

        quorumSet.innerQuorumSets.forEach(innerQS => {
            if (this.quorumSetCanReachThreshold(innerQS, failingNodes)) {
                counter++;
            }
        });

        return counter >= quorumSet.threshold;
    }
}

module.exports = Network;
