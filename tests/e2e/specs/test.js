// https://docs.cypress.io/api/introduction/api.html

describe('views/Home', () => {
    it('Visits the app root url', () => {
        //cy.fixture('nodes').as('nodesJSON');
        //cy.server();
        //cy.route('GET', '/v1/nodes', '@nodesJSON');
        cy.visit('/');
        cy.contains('a', 'Home');
        cy.contains('a', 'Nodes');
        cy.contains('a', 'Quorum Monitor');
        cy.contains('a', 'API');
        cy.contains('a', 'About');
        cy.get('.page-title');
        cy.contains('h1', 'Stellar Network');
        cy.contains('div', "Nodes");
        cy.contains('div', "Validators");
        cy.contains('div', "Active Nodes");
        cy.contains('div', "Active Validators");
        cy.contains('div', "Failing Validators");
        cy.get('#map');
        cy.get('.leaflet-marker-icon');
        cy.contains('h3', "Quorumset connections");
        cy.contains('h3', "Node countries");
        cy.contains('h3', "Node Versions");
        cy.get('#versionGraph');
        cy.get('#countryDistributionGraph');
    })
});