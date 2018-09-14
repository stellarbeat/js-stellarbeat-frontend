# Goals
## Explore
Explore and gain insight on the network through various visualisations & analysis.
## simulate
Adapt the network by updating quorumSets, adding/removing nodes, toggling nodes on/off and see the results live in the browser. 
## export
- quorum set configurations
- network simulation results

# Architecture
Javascript browser app with api backend. Nodejs modules that can be reused on frontend and backend. This should provide us with a manageable/reusable codebase and allow us to simulate live in the browser and push heavier computations to the backend. 
## Modules
### connector
General purpose library that connects the stellar-core and can issue commands
### crawler
Uses the connector to crawl the network
### harvester (todo)
Initiates the crawler and augments the nodes with statistics (uptime,...) and other data like displayname, location,...
Provides persistent storage. 
### api (todo)
Exposes the nodes & analytic processes. e.g. 

`GET /nodes/{publicKey}`

`POST /compute/quorum-intersection`

### network analysis (todo: extract from quorum monitor)
e.g. compute node failure from quorumSets, quorum slices, quorum intersection,...
### network visualisation (todo: extract from quorum monitor)
https://vuejs.org/v2/guide/single-file-components.html
### quorum monitor
this
## Technology
### nodejs
https://nodejs.org/en/

### vuejs
https://vuejs.org/

### d3js
https://d3js.org/

### flow
https://flow.org/

## Install
`npm install`

`npm run flow:deps`

`npm run build`

`open web/index.html in browser`