import { Connection, Destinations } from "@/types";
import fs from "node:fs/promises";
import { getStationIds } from "../data/stations.ts";
import { connectionsForStation, getConnectionsForLine } from "./connections.ts";
import { getDepartures } from "./hafas.ts";
import { groupBy, parallel, unique } from "./util.ts";
import assert from "node:assert/strict";

const maxChanges = 2;
const maxDuration = 4 * 60 * 60;

main();

async function main() {
  const stationIds = await getStationIds();
  assert(stationIds.length > 5000, `${stationIds.length} is not enough stations`);

  const departures = await parallel(50, stationIds, getDepartures, "stations");
  assert(departures.length > 100000, `${departures.length} is not enough departures`);

  const tripsByLine = groupBy(
    departures,
    (d) => d.line,
    (d) => d.trip,
  );
  const linesByStation = groupBy(
    departures,
    (d) => d.station,
    (d) => d.line,
  );

  const connections = await parallel(50, Object.entries(tripsByLine), getConnectionsForLine, "trips");

  const connectionsByLine = groupBy(
    connections,
    (c) => c.line,
    (c) => c,
  );

  logUnresolvedLines(tripsByLine, connectionsByLine);

  for (const [station, lines] of Object.entries(linesByStation)) {
    const destinations: Destinations = {};

    const uniqueLines = unique(lines);

    for (const line of uniqueLines) {
      findDestinations(station, connectionsByLine, linesByStation, line, destinations);
    }

    await fs.writeFile(`./data/destinations/${station}.json`, JSON.stringify(destinations));
  }

  console.log("relevant stations", Object.keys(linesByStation).length);
  console.log("relevant lines", Object.keys(connectionsByLine).length);
}

function findDestinations(
  initialStation: string,
  connectionsByLine: Record<string, Connection[]>,
  linesByStation: Record<string, string[]>,
  line: string,
  destinations: Destinations,
  changeStation = initialStation,
  changed: string[] = [],
  duration = 0,
) {
  if (changed.length > maxChanges) {
    return;
  }

  const connections = connectionsForStation(connectionsByLine[line], changeStation, line);

  for (const connection of connections) {
    duration += connection.duration;
    if (duration > maxDuration || connection.to === initialStation) {
      continue;
    }

    if (
      !destinations[connection.to] ||
      destinations[connection.to].duration > duration ||
      (destinations[connection.to].duration === duration && destinations[connection.to].changed.length > changed.length)
    ) {
      destinations[connection.to] = { duration, line, changed };

      if (linesByStation[connection.to] && connection.to) {
        for (const nextLine of linesByStation[connection.to]) {
          findDestinations(
            initialStation,
            connectionsByLine,
            linesByStation,
            nextLine,
            destinations,
            connection.to,
            [...changed, connection.to],
            duration + connection.pause,
          );
        }
      }
    }

    duration += connection.pause;
  }
}

function logUnresolvedLines(tripsByLine: Record<string, string[]>, connectionsByLine: Record<string, Connection[]>) {
  for (const line of Object.keys(tripsByLine)) {
    if (!(line in connectionsByLine)) {
      console.log(`${line} was not resolved ${tripsByLine[line]}`);
    }
  }
}
