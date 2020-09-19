## Running on a local Web Server

In this section we show how to run this tool using a local web server.

1. Install [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
	- This requires a `Rustup` installation which can be downloaded [here](https://www.rust-lang.org/tools/install).
2. Build the sources in the project's root directory: 

```
wasm-pack build --target web
```

3. Start a local HTTP server of your choice such as Python3's http.server:

```
python3 -m http.server
```

Alternatively, the analyses may be performed on our server which can be found [here](https://trudi.weizenbaum-institut.de/stellar_analysis.html).

## Deployment to a Web Server

This section covers how this tool can be deployed to your web server instead.

1. Build the sources as shown above (item 1 & 2).
2. Copy the following files to the location of your web server's filesystem maintaining the directory structure:

	- `index.html`
	- `data_handler.js`
	- `graph.js`
	- `layout.css`
	- `util.js`
	- `pkg/stellar_analysis_bg.wasm`
	- `pkg/stellar_analysis.js`

	The rest of the files do not need to be copied to your web server.

3. Depending on your web server, you can now serve the page on your server.

The analyses performed here are powered by the [fbas_analyzer](https://github.com/wiberlin/fbas_analyzer) tool/library.
