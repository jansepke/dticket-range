# dticket-range

## Limitations

- recognizes only departures on the next monday

## Local Setup

1. install node 20.6+
1. create API credentials for [StaDa - Station Data API](https://developers.deutschebahn.com/db-api-marketplace/apis/product/stada/api/51622)
1. add DB_CLIENT_ID and DB_API_KEY to `.env.local` file (see `.env.local.template`)
1. run `npm install`
1. run `npm run import`

## TODO

- input field
- combine multiple stations in same city
- change settings in UI
- explain results
- dependabot
- automatic redeploy

## Inspired by

- the great work of [@derhuerst](https://github.com/derhuerst)
- the great work of [@juliuste](https://github.com/juliuste)
