const puppeteer = require('puppeteer');

describe("views", () => {
    /*test("toml-config-viewer", async () => {
        let browser = await puppeteer.launch({
            headless: true
        });
        let page = await browser.newPage();

        page.emulate({
            viewport: {
                width: 500,
                height: 2400
            },
            userAgent: ''
        });

        await page.goto(process.env.VUE_APP_E2E_TEST_URL + 'quorum-monitor/GCM6QMP3DLRPTAZW2UZPCPX2LF3SXWXKPMP3GKFZBDSF3QZGV2G5QSTK?center=0&no-scroll=1');

        await page.waitForSelector('.page-title');

        let title = await page.$eval('.page-title', el => el.innerText);
        expect(title).toEqual('Quorum Monitor');

        let tomlConfigViewer = await page.$eval('.toml-config-viewer', el => el.innerText);
        expect(tomlConfigViewer).toBeDefined();

        browser.close();
    }, 16000);*/
});
/*
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
});*/