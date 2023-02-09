[![Known Vulnerabilities](https://snyk.io/test/github/stellarbeat/js-stellarbeat-frontend/badge.svg)](https://snyk.io/test/github/stellarbeat/js-stellarbeat-frontend)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
# Stellarbeat frontend 
Frontend website for https://stellarbeat.io. 

Built with the https://vuejs.org/ framework. (Migration to vue3 is in progress, currently on 2.7) 

Shared code with backend can be found at https://github.com/stellarbeat/js-stellarbeat-shared/

Backend (API) code can be found at https://github.com/stellarbeat/js-stellarbeat-backend

## Usage 
### installation
`yarn install`

Copy .env.dist to .env and fill in the values.

### development mode
`yarn run serve` 

### production build
production build:
`yarn run build`

## Pre-rendering 
Pre-rendering is handled by https://prerender.io/

