import axios from "axios";
import {Network, Node, Organization} from '@stellarbeat/js-stellar-domain';

export default class Store {
    public isLoading: boolean = true;
    public fetchingDataFailed: boolean = false;
    public network!: Network;

    async fetchData(): Promise<any> {
        try {
            let result = await axios.get(process.env.VUE_APP_NODES_API_URL);
            if (result.data.nodes) {
                let nodes = result.data.nodes
                    .map((node: any) => Node.fromJSON(node));

                let organizations = [];
                if (result.data.organizations) {
                    organizations = result.data.organizations.map((organization:any) => Organization.fromJSON(organization));
                }
                this.network = new Network(nodes, organizations);
            } else {
                this.fetchingDataFailed = true;
            }
        } catch (error) {
            this.fetchingDataFailed = true;
            this.isLoading = false;
        }

        this.isLoading = false;
    }
}