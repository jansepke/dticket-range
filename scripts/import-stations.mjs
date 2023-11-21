// from https://github.com/derhuerst/db-stations

import fs from "node:fs/promises";
import assert from "node:assert/strict";
import cleanStationName from "db-clean-station-name";

const endpoint = "https://apis.deutschebahn.com/db-api-marketplace/apis/station-data/v2/stations";

const DB_CLIENT_ID = process.env.DB_CLIENT_ID;
assert(DB_CLIENT_ID, "DB_CLIENT_ID not set");
const DB_API_KEY = process.env.DB_API_KEY;
assert(DB_API_KEY, "DB_API_KEY not set");

const response = await fetch(endpoint, {
  headers: {
    "DB-Client-Id": DB_CLIENT_ID,
    "DB-Api-Key": DB_API_KEY,
  },
});

if (!response.ok) {
  throw new Error(`status code ${res.status}`);
}

const { result } = await response.json();

console.log(result.length, "stations from API");

const stations = result.filter((data) => data.evaNumbers.length > 0).map(parseStation);

console.log(stations.length, "stations with ID");

await fs.writeFile("data/stations.json", JSON.stringify(stations));

function parseStation(data) {
  const station = {
    id: parseId(data.evaNumbers),
    name: cleanStationName(data.name),
    location: parseLocation(data.evaNumbers),
    city: data.mailingAddress.city,
  };

  assert(station.id, `station.id ${JSON.stringify(data, null, 2)}`);
  assert(station.id.length === 7, `station.id.length ${station.id.length}`);

  return station;
}

function parseId(evaNumbers) {
  const eva = evaNumbers.find((eva) => eva.isMain) ?? evaNumbers[0];
  return eva?.number?.toString();
}

function parseLocation(evaNumbers) {
  const coordinates = evaNumbers[0]?.geographicCoordinates?.coordinates;

  return { lat: coordinates?.[1], lng: coordinates?.[0] };
}
