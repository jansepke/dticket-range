# dticket-range

## Local Setup

1. install node 20.6+
1. create API credentials for [StaDa - Station Data API](https://developers.deutschebahn.com/db-api-marketplace/apis/product/stada/api/51622)
1. add DB_CLIENT_ID and DB_API_KEY to `.env.local` file (see `.env.local.template`)
1. run `npm install`
1. run `npm run import`

## TODO

- thank
- TS for scripts
- input field
- combine multiple stations in same city
- change settings in UI
- explain results
- use https://www.npmjs.com/package/db-clean-station-name
