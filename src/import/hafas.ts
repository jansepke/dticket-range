/// <reference path="../types/db-hafas.d.ts" />
import { RAlternative, RTrip } from "@/types/hafas-client";
import { createDbHafas } from "db-hafas";
import assert from "node:assert";
import { ignoreProducts } from "./configuration.ts";

const hafas = createDbHafas("jansepke");

const startOfNextMonday = new Date();
startOfNextMonday.setDate(startOfNextMonday.getDate() + ((1 + 7 - startOfNextMonday.getDay()) % 7));
startOfNextMonday.setUTCHours(0, 0, 0, 0);

const oneDay = 24 * 60;

const validProductName = (productName?: string) => !!productName && !ignoreProducts.includes(productName);
const validForDTicket = (d: RAlternative) => validProductName(d.line.productName);

export const getDepartures = async (stationId: string): Promise<{ station: string; line: string; trip: string }[]> => {
  try {
    const departures = await hafas.departures(stationId, {
      when: startOfNextMonday,
      duration: oneDay, // more is not possible
      results: 1000,
      products: {
        nationalExpress: false,
        national: false,
        regionalExpress: true,
        regional: true,
        suburban: false,
        bus: false,
        ferry: false,
        subway: false,
        tram: false,
        taxi: false,
      },
    });

    return (departures.departures as RAlternative[]).filter(validForDTicket).map((d) => {
      assert(d.line?.id, `lineId missing ${d}`);

      return { station: stationId, line: d.line.adminCode + d.line.id, trip: d.tripId };
    });
  } catch (error) {
    if (error instanceof Error && error.toString() !== "Error: LOCATION: location/stop not found") {
      console.error(stationId, error.toString());
    }
    return [];
  }
};

export const getTrip = async (tripId: string): Promise<RTrip> => {
  try {
    const trip = await hafas.trip(tripId, {});

    return trip.trip as RTrip;
  } catch (error) {
    if (error instanceof Error) {
      console.error(tripId, error.toString());
    }
    throw error;
  }
};
