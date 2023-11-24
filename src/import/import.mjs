import assert from "node:assert";
import fs from "node:fs/promises";
import { connectionsForStation, connectionsFromTrip } from "./connections.mjs";
import { getDepartures, getTrip } from "./hafas.mjs";
import { logProgress, parallel, unique } from "./util.mjs";

const maxChanges = 2;
const maxDuration = 4 * 60 * 60;

const stations = JSON.parse(await fs.readFile("data/stations.json", "utf-8"));

const relevantStations = {};
const relevantLines = {};

const analyzeStation = async (index, station) => {
  const departures = await getDepartures(station.id);

  logProgress("stations", index, stations.length);

  for (const departure of departures) {
    if (!relevantLines[departure.line.id]) {
      relevantLines[departure.line.id] = [departure.tripId];
    } else {
      relevantLines[departure.line.id].push(departure.tripId);
    }
  }

  if (departures.length > 0) {
    relevantStations[station.id] = unique(departures.map((d) => d.line.id));
  }
};

let stopCount = 0;

const analyzeTrip = async (index, [line, trips]) => {
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

  relevantLines[trip.line.id] = connectionsFromTrip(trip);
};

await parallel(50, stations, analyzeStation);
await parallel(50, Object.entries(relevantLines), analyzeTrip);

for (const [line, connections] of Object.entries(relevantLines)) {
  assert(typeof connections === "object", `${line} was not resolved ${connections}`);
}

for (const [station, lines] of Object.entries(relevantStations)) {
  const destinations = {};

  for (const line of lines) {
    findDestinations(station, line, destinations);
  }

  fs.writeFile(`./data/destinations/${station}.json`, JSON.stringify(destinations));
}

console.log("relevantStations", Object.keys(relevantStations).length);
console.log("relevantLines", Object.keys(relevantLines).length);
console.log("stops", stopCount);

function findDestinations(station, line, destinations, changed = 0, duration = 0) {
  if (changed > maxChanges) {
    return;
  }

  const connections = connectionsForStation(relevantLines[line], station, line);

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
// HBF 8002549
