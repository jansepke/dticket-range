import { Connection, Destinations, Station } from "@/types";
import assert from "node:assert";
import fs from "node:fs/promises";
import { connectionsForStation, connectionsFromTrip } from "./connections.ts";
import { getDepartures, getTrip } from "./hafas.ts";
import { logProgress, parallel, unique } from "./util.ts";

const maxChanges = 2;
const maxDuration = 4 * 60 * 60;

let stopCount = 0;

const relevantStations: Record<string, string[]> = {};
const relevantLines: Record<string, string[]> = {};
const relevantTrips: Record<string, Connection[]> = {};

main();

async function main() {
  const stations = JSON.parse(await fs.readFile("data/stations.json", "utf-8")) as Station[];

  const analyzeStation = async (index: number, station: Station) => {
    const departures = await getDepartures(station.id);

    logProgress("stations", index, stations.length);

    for (const departure of departures) {
      assert(departure.line?.id, `lineId missing ${departure}`);
      if (!relevantLines[departure.line.id]) {
        relevantLines[departure.line.id] = [departure.tripId];
      } else {
        relevantLines[departure.line.id].push(departure.tripId);
      }
    }

    if (departures.length > 0) {
      relevantStations[station.id] = unique(departures.map((d) => d.line.id!));
    }
  };

  await parallel(50, stations, analyzeStation);
  await parallel(50, Object.entries(relevantLines), analyzeTrip);

  for (const line of Object.keys(relevantLines)) {
    if (!(line in relevantTrips)) {
      console.log(`${line} was not resolved ${relevantLines[line]}`);
    }
  }

  for (const [station, lines] of Object.entries(relevantStations)) {
    const destinations: Destinations = {};

    for (const line of lines) {
      findDestinations(station, line, destinations);
    }

    fs.writeFile(`./data/destinations/${station}.json`, JSON.stringify(destinations));
  }

  console.log("relevantStations", Object.keys(relevantStations).length);
  console.log("relevantTrips", Object.keys(relevantTrips).length);
  console.log("stops", stopCount);
}

const analyzeTrip = async (index: number, [line, trips]: [string, string[]]): Promise<void> => {
  if (trips.length === 0) {
    return;
  }

  const trip = await getTrip(trips[0]);

  if (line !== trip.line.id) {
    console.log("trip not matching line", line, trip.line.id);
    return await analyzeTrip(index, [line, trips.slice(1)]);
  }

  logProgress("trips", index, Object.values(relevantLines).length);

  stopCount += trip.stopovers.length;

  relevantTrips[trip.line.id] = connectionsFromTrip(trip);
};

function findDestinations(station: string, line: string, destinations: Destinations, changed = 0, duration = 0) {
  if (changed > maxChanges) {
    return;
  }

  const connections = connectionsForStation(relevantTrips[line], station, line);

  for (const connection of connections) {
    duration += connection.duration;
    if (duration > maxDuration) {
      continue;
    }

    if (
      !destinations[connection.to] ||
      destinations[connection.to].duration > duration ||
      (destinations[connection.to].duration === duration && destinations[connection.to].changed > changed)
    ) {
      destinations[connection.to] = { duration, line, changed };

      if (relevantStations[connection.to] && connection.to) {
        for (const nextLine of relevantStations[connection.to]) {
          findDestinations(connection.to, nextLine, destinations, changed + 1, duration + connection.pause);
        }
      }
    }

    duration += connection.pause;
  }
}
