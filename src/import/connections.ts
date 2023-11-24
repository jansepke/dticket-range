import { Connection } from "@/types";
import { RTrip } from "@/types/hafas-client";

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

      connections.push({ from, to, duration, pause });
    }

    prevStop = stop;
  }

  return connections;
}

export function connectionsForStation(connections: Connection[], station: string, line: string) {
  if (!Array.isArray(connections)) {
    console.error(`no connections for ${station} and ${line}`);
    return [];
  }

  const isReverse = connections.find((c) => c.to === station);

  if (isReverse) {
    connections = connections.reverse().map((c) => ({ to: c.from, from: c.to, duration: c.duration, pause: c.pause }));
  }

  const startIdx = connections.findIndex((c) => c.from === station);
  if (startIdx < 0) {
    // TODO
    // console.error(`could not find ${station} in ${line}`);
    return [];
  }

  return connections.slice(startIdx);
}
