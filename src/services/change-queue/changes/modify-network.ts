import {Node, Network, Organization} from '@stellarbeat/js-stellar-domain';
import {NetworkChange} from '@/services/change-queue/network-change-queue';

export class ModifyNetwork implements NetworkChange {
    _network: Network;
    _originalNodes: Node[];
    _originalOrganizations: Organization[];
    _newNodes: Node[];
    _newOrganizations: Organization[];

    constructor(network: Network, newNodes: Node[], newOrganizations: Organization[] ){
        this._network = network;
        this._originalNodes = this._network.nodes;
        this._originalOrganizations = this._network.organizations;
        this._newNodes = newNodes;
        this._newOrganizations = newOrganizations;
    }

    execute(): void {
        this._network.nodes = this._newNodes;
        this._network.organizations = this._newOrganizations;
    }

    revert(): void {
        this._network.nodes = this._originalNodes;
        this._network.organizations = this._originalOrganizations;
   }
}