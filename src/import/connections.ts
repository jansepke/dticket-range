import { Connection } from "@/types";
import { RTrip } from "@/types/hafas-client";
import { getTrip } from "./hafas.ts";

export function connectionsFromTrip(trip: RTrip) {
  const connections: Connection[] = [];
  let prevStop;

  for (const stop of trip.stopovers) {
    if (prevStop) {
      const duration =
        (new Date(stop.plannedArrival ?? stop.departure!).getTime() - new Date(prevStop.departure!).getTime()) / 1000;
      const pause =
        stop.departure && stop.plannedArrival
          ? (new Date(stop.departure).getTime() - new Date(stop.plannedArrival).getTime()) / 1000
          : 0;
      const from = prevStop.stop!.id!;
      const to = stop.stop!.id!;

      if (duration < 0) {
        throw new Error(`duration < 0 for ${trip.line.id} from ${from} to ${to}`);
      }

      connections.push({ from, to, duration, pause, line: trip.line.id! });
    }

    prevStop = stop;
  }

  return connections;
}

export function connectionsForStation(connections: Connection[], station: string, line: string) {
  if (!Array.isArray(connections)) {
    // console.error(`no connections for ${station} and ${line}`);
    return [];
  }

  const isReverse = connections.find((c) => c.to === station);

  if (isReverse) {
    connections = connections.reverse().map(({ from, to, ...c }) => ({ to: from, from: to, ...c }));
  }

  const startIdx = connections.findIndex((c) => c.from === station);
  if (startIdx < 0) {
    // TODO
    // console.error(`could not find ${station} in ${line}`);
    return [];
  }

  return connections.slice(startIdx);
}

export const getConnectionsForLine = async ([line, trips]: [string, string[]]): Promise<Connection[]> => {
  if (trips.length === 0) {
    return [];
  }

  const trip = await getTrip(trips[0]);

  if (line !== trip.line.id) {
    console.log("trip not matching line", line, trip.line.id);
    return await getConnectionsForLine([line, trips.slice(1)]);
  }

  return connectionsFromTrip(trip);
};
