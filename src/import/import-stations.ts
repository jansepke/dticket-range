// from https://github.com/derhuerst/db-stations

/// <reference path="../types/db-clean-station-name.d.ts" />
import cleanStationName from "db-clean-station-name";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { DBAPIEvaNumbers, DBAPIStation, DBAPIStationResponse } from "../types/db-api";
import { Station } from "@/types";

const endpoint = "https://apis.deutschebahn.com/db-api-marketplace/apis/station-data/v2/stations";

const DB_CLIENT_ID = process.env.DB_CLIENT_ID;
assert(DB_CLIENT_ID, "DB_CLIENT_ID not set");
const DB_API_KEY = process.env.DB_API_KEY;
assert(DB_API_KEY, "DB_API_KEY not set");

main();

async function main() {
  const response = await fetch(endpoint, {
    headers: {
      "DB-Client-Id": DB_CLIENT_ID!,
      "DB-Api-Key": DB_API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error(`status code ${response.status}`);
  }

  const { result } = (await response.json()) as DBAPIStationResponse;

  console.log(result.length, "stations from API");

  const stations = result.filter((data) => data.evaNumbers.length > 0).map(parseStation);

  console.log(stations.length, "stations with ID");

  await fs.writeFile("data/stations.json", JSON.stringify(stations));
}

function parseStation(data: DBAPIStation) {
  const id = parseId(data.evaNumbers);
  assert(id, `no id for ${data}`);
  assert(id.length === 7, `station.id.length ${id.length}`);

  const coordinates = parseCoordinates(data.evaNumbers);
  assert(coordinates, `no coordinates for ${data}`);

  const station: Station = {
    id: id,
    name: cleanStationName(data.name),
    location: { lat: coordinates[1], lng: coordinates[0] },
    city: data.mailingAddress.city,
  };

  return station;
}

function parseId(evaNumbers: DBAPIEvaNumbers[]) {
  const eva = evaNumbers.find((eva) => eva.isMain) ?? evaNumbers[0];
  return eva?.number?.toString();
}

function parseCoordinates(evaNumbers: DBAPIEvaNumbers[]) {
  return evaNumbers[0]?.geographicCoordinates?.coordinates;
}
